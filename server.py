#!/usr/bin/env python3
"""
WhatsApp Template Messenger Server
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import socket
import sys
import os
import json
import subprocess
from urllib.parse import urlparse, parse_qs, unquote

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORTS = [8080, 8081, 8082, 8083, 8084, 8085, 3000, 3001, 5000, 5500]
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')


def load_data():
    """Load data from JSON file"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"  [ERROR loading data]: {e}")
    return {}


def save_data(data):
    """Save data to JSON file"""
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"  [ERROR saving data]: {e}")
        return False


class MyHandler(SimpleHTTPRequestHandler):

    # Fix encoding for JavaScript files to properly serve emojis
    def guess_type(self, path):
        mimetype = super().guess_type(path)
        if path.endswith('.js'):
            return 'application/javascript; charset=utf-8'
        if path.endswith('.html'):
            return 'text/html; charset=utf-8'
        if path.endswith('.css'):
            return 'text/css; charset=utf-8'
        if path.endswith('.json'):
            return 'application/json; charset=utf-8'
        return mimetype

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/open-folder':
            self.handle_open_folder(parsed.query)
            return

        if path == '/api/data':
            self.handle_get_data()
            return

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/data':
            self.handle_save_data()
            return

        self.send_error(404, 'Not Found')

    def handle_get_data(self):
        """Return stored data"""
        data = load_data()
        self.send_json(data)

    def handle_save_data(self):
        """Save data to file"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            if save_data(data):
                self.send_json({'success': True})
            else:
                self.send_json({'success': False, 'error': 'Failed to save'})
        except Exception as e:
            print(f"  [ERROR]: {e}")
            self.send_json({'success': False, 'error': str(e)})

    def handle_open_folder(self, query_string):
        """Open folder in Windows Explorer"""
        try:
            params = parse_qs(query_string)
            file_path = params.get('path', [''])[0]
            file_path = unquote(file_path)

            print(f"\n  [PATH RECEIVED]: {repr(file_path)}")

            if not file_path:
                self.send_json({'success': False, 'error': 'No path'})
                return

            # Clean and convert path
            win_path = self.to_windows_path(file_path)
            print(f"  [WINDOWS PATH]: {repr(win_path)}")

            if not win_path:
                self.send_json({'success': False, 'error': 'Invalid path format'})
                return

            # Open in Explorer - use powershell for better path handling
            try:
                # PowerShell handles paths with spaces better
                ps_cmd = f'explorer.exe /select,\\"{win_path}\\"'
                print(f"  [COMMAND]: powershell -c \"{ps_cmd}\"")

                subprocess.run(
                    ['powershell.exe', '-Command', f'explorer.exe /select,"{win_path}"'],
                    capture_output=True
                )

                print(f"  [SUCCESS]: Opened folder for {win_path}")
                self.send_json({'success': True, 'path': win_path})

            except Exception as e:
                print(f"  [ERROR]: {e}")
                self.send_json({'success': False, 'error': str(e)})

        except Exception as e:
            print(f"  [ERROR]: {e}")
            self.send_json({'success': False, 'error': str(e)})

    def to_windows_path(self, path):
        """Clean and convert path to Windows format"""
        # Remove surrounding quotes and whitespace
        path = path.strip()
        if (path.startswith('"') and path.endswith('"')) or \
           (path.startswith("'") and path.endswith("'")):
            path = path[1:-1]
        path = path.strip()

        print(f"  [CLEANED PATH]: {repr(path)}")

        # Already Windows format (C:\ or D:\)
        if len(path) >= 3 and path[1] == ':' and path[2] in ('\\', '/'):
            return path.replace('/', '\\')

        # Just drive letter (C:)
        if len(path) >= 2 and path[1] == ':':
            return path.replace('/', '\\')

        # WSL format /mnt/c/...
        if path.startswith('/mnt/'):
            rest = path[5:]
            if rest:
                drive = rest[0].upper()
                remainder = rest[1:].lstrip('/')
                return f"{drive}:\\{remainder.replace('/', '\\')}"

        return None

    def send_json(self, data):
        response = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Content-Length', len(response))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(response)

    def end_headers(self):
        if self.path.endswith('.js') or self.path.endswith('.html') or self.path.endswith('.css'):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")


def find_port():
    for port in PORTS:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('0.0.0.0', port))
                return port
        except:
            pass
    return None


def get_lan_ip():
    """Get the LAN IP address for mobile access"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return None


def main():
    port = find_port()
    if not port:
        print("No free port!")
        input("Press Enter...")
        sys.exit(1)

    lan_ip = get_lan_ip()
    url = f"http://localhost:{port}"
    print("=" * 50)
    print("  WhatsApp Template Messenger")
    print("=" * 50)
    print(f"  Local:  {url}")
    if lan_ip:
        print(f"  Mobile: http://{lan_ip}:{port}")
    print("  Ctrl+C to stop")
    print("=" * 50 + "\n")

    webbrowser.open(url)

    server = HTTPServer(('0.0.0.0', port), MyHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
