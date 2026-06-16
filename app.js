// WhatsApp Template Messenger - Application Logic

// ─── Dark Theme ─────────────────────────────────────────────────────────────
(function () {
    const STORAGE_KEY = 'df-theme';
    const html = document.documentElement;

    function applyTheme(dark) {
        html.setAttribute('data-theme', dark ? 'dark' : 'light');
    }

    // Apply immediately to avoid flash
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved ? saved === 'dark' : prefersDark);

    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;

        btn.addEventListener('click', function () {
            const isDark = html.getAttribute('data-theme') === 'dark';
            applyTheme(!isDark);
            localStorage.setItem(STORAGE_KEY, !isDark ? 'dark' : 'light');
        });
    });
})();
// ────────────────────────────────────────────────────────────────────────────

// DOM Elements
const elements = {
    // Global settings inputs
    phone: document.getElementById('phone'),
    name: document.getElementById('name'),
    owner_name: document.getElementById('owner_name'),
    clinic_name: document.getElementById('clinic_name'),
    clinic_phone: document.getElementById('clinic_phone'),
    email: document.getElementById('email'),
    clinic_google: document.getElementById('clinic_google'),
    clinic_address: document.getElementById('clinic_address'),
    notes: document.getElementById('notes'),
    follow_up_notes: document.getElementById('follow_up_notes'),

    // Contacts
    contactSearch: document.getElementById('contactSearch'),
    contactsList: document.getElementById('contactsList'),
    saveContactBtn: document.getElementById('saveContactBtn'),
    clearFormBtn: document.getElementById('clearFormBtn'),

    // Templates
    templatesGrid: document.getElementById('templatesGrid'),
    addTemplateBtn: document.getElementById('addTemplateBtn'),
    reloadTemplatesBtn: document.getElementById('reloadTemplatesBtn'),

    // Modal
    modalOverlay: document.getElementById('modalOverlay'),
    templateModal: document.getElementById('templateModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModal: document.getElementById('closeModal'),
    templateName: document.getElementById('templateName'),
    templateMessage: document.getElementById('templateMessage'),
    filesList: document.getElementById('filesList'),
    addFileBtn: document.getElementById('addFileBtn'),
    deleteTemplate: document.getElementById('deleteTemplate'),
    cancelTemplate: document.getElementById('cancelTemplate'),
    saveTemplate: document.getElementById('saveTemplate'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// State
let currentTemplateId = null;
let currentContactId = null;
let templates = [];
let savedContacts = [];
let uiPosition = null;

// New CRM state
let globalCategories = [];
let tasksCurrentCat = '__calendar__';
let tasksCalYear = null;
let tasksCalMonth = null;
let tasksDayViewDate = null;
let tasksDetailContactId = null;
let tasksDetailBackView = 'day';
let tasksDetailEditMode = false;
let tasksLastContactByCategory = {};
let tasksLastContactFromCalendar = null;
let scheduledDatePicker = null;
let currentContactScheduledDate = null;
let currentContactCategory = null;

// ... (skipping defaultTemplates for brevity in my thought, but I must provide the FULL replacement string)


// Default Templates - RCT (Low Pain / Sensitivity Case)
const defaultTemplates = [
    {
        id: 'rct-msg-1',
        name: 'RCT 1 - Education (Why It Feels Not Serious)',
        message: `Hi {name},
During your consultation at {clinic_name}, we noticed that your tooth **does not hurt much right now**, but it **reacts to hot/cold** 🦷
This usually means the nerve inside the tooth is **already infected**, even if pain is mild or ignored.

Most patients delay treatment at this stage because daily pain is not present 🙂
But this stage is actually the **best time to treat the tooth safely**.`,
        files: [
            {
                label: 'Video - Timeline 1',
                path: 'C:\\Users\\ACER\\Videos\\final\\cosmetics\\Timeline 1.mp4',
                filename: 'Timeline 1.mp4'
            }
        ]
    },
    {
        id: 'rct-msg-2',
        name: 'RCT 2 - Consequences (What Happens If Ignored)',
        message: `When RCT is delayed, the infection **does not stop on its own** ❌
It slowly spreads deeper, which can lead to:
• Sudden severe pain
• Swelling or pus
• Tooth fracture
• Eventual tooth loss 😟

Early treatment = simple procedure
Late treatment = complex, painful, and expensive`,
        files: [
            {
                label: 'Video - Timeline 2',
                path: 'C:\\Users\\ACER\\Videos\\final\\cosmetics\\RCT\\Timeline 2.mp4',
                filename: 'Timeline 2.mp4'
            }
        ]
    },
    {
        id: 'rct-msg-3',
        name: 'RCT 3 - Procedure Reassurance (Fear Reduction)',
        message: `Many patients worry that RCT is painful — but modern RCT is actually **pain-relieving**, not pain-causing 😌
The infected nerve is removed, the tooth is cleaned, and pain stops.

Here's a glimpse of how precision tools and light curing help seal and protect the tooth safely 🛠️`,
        files: [
            {
                label: 'Image - Light Cure',
                path: 'C:\\Users\\ACER\\Videos\\final\\cosmetics\\RCT\\light-cure-1.jpg',
                filename: 'light-cure-1.jpg'
            }
        ]
    },
    {
        id: 'rct-msg-4',
        name: 'RCT 4 - Value & Long-Term Result',
        message: `After RCT, placing a crown is important 👑
It protects the treated tooth and restores full chewing strength.

Without a crown, the tooth becomes weak and may crack later ⚠️
With a crown, the tooth can last **many years like a natural tooth**.`,
        files: [
            {
                label: 'Image - Crown Importance',
                path: 'C:\\Users\\ACER\\Videos\\final\\cosmetics\\RCT\\importance-of-crown-after-rct.jpg',
                filename: 'importance-of-crown-after-rct.jpg'
            }
        ]
    },
    {
        id: 'rct-msg-5',
        name: 'RCT 5 - Soft CTA (Call to Action)',
        message: `Since your tooth is already showing early nerve involvement, **this is the ideal time to save it** 🦷✨
RCT done now is simpler, faster, and prevents future emergencies.

You can easily reconnect with us below 👇

📞 Call Doctor: {clinic_phone}
📍 Clinic Location: {clinic_address}
⭐ Google Reviews: {clinic_google}`,
        files: []
    },
    {
        id: 'implant-msg-1',
        name: 'Implant 1 - Day 1 Post-Extraction Check-in',
        message: `Hi {name}, this is {clinic_name} checking on you 😊
Your extraction area should feel better today.

Very important: the empty space has now started healing, but the bone also starts shrinking from today.

That is why implants are planned soon after removal — waiting makes placement harder and sometimes impossible later.

If you feel unusual swelling or pain you can call us at {clinic_phone}.

When you feel ready, we will schedule the implant planning visit.`,
        files: []
    },
    {
        id: 'implant-msg-2',
        name: 'Implant 2 - Day 3 Teeth Shifting Warning',
        message: `Hi {name} 😊
Just a reminder from {clinic_name} — most patients think the job is finished after removal.

Actually, extraction is only step 1.

Without a tooth, the nearby teeth slowly tilt and chewing pressure shifts to other side. This later causes more treatment than just one implant.

If you want us to check healing and plan the tooth replacement, call {clinic_phone}.

We keep short review slots for recent patients.`,
        files: []
    },
    {
        id: 'implant-msg-3',
        name: 'Implant 3 - Day 5 Bone Loss Video',
        message: `Hi {name} 😊
This short video explains what happens after removal if a new tooth is not placed.

Many people notice cheek sinking or older facial look after some months — this is bone loss, not ageing.

Implant timing prevents that.

If you'd like us to secure the bone early, call {clinic_phone}. We will guide you.`,
        files: [
            {
                label: 'Video - Bone Loss Explanation',
                path: 'C:\\Users\\ACER\\Videos\\final\\cosmetics\\Extraction dONE , Implant\\wedfef.mp4',
                filename: 'wedfef.mp4'
            }
        ]
    },
    {
        id: 'implant-msg-4',
        name: 'Implant 4 - Day 7 Before/After Bone Shrinkage',
        message: `Hi {name} 🙂
Here is a real example of before and after bone shrinkage.

Once the bone collapses, treatment becomes longer and more expensive.

Right now your healing stage is the ideal window.

You can reach {clinic_name} at {clinic_phone} to reserve a planning visit at {clinic_address}.`,
        files: [
            {
                label: 'Image - Bone Loss Before/After',
                path: 'C:\\Users\\ACER\\Videos\\final\\cosmetics\\Extraction dONE , Implant\\facial-collapse-after-tooth-bone-lose-before-after.jpg',
                filename: 'facial-collapse-after-tooth-bone-lose-before-after.jpg'
            }
        ]
    },
    {
        id: 'implant-msg-5',
        name: 'Implant 5 - Day 10 Domino Effect Video',
        message: `Hi {name} 😊
This 3D clip shows the domino effect after one missing tooth.

The opposite tooth starts coming down, neighbours move, and bite changes.

At that stage people need multiple treatments instead of one implant.

We want to help you avoid that.
Call {clinic_phone} and we will check if your bone is still in the simple stage.`,
        files: [
            {
                label: 'Video - Domino Effect',
                path: 'C:\\Users\\ACER\\Videos\\final\\cosmetics\\Extraction dONE , Implant\\domino effect.mp4',
                filename: 'domino effect.mp4'
            }
        ]
    },
    {
        id: 'implant-msg-6',
        name: 'Implant 6 - Day 14 Final Window CTA',
        message: `Hi {name} 🙂
It has been two weeks since your extraction at {clinic_name}.

This is usually the last ideal period for straightforward implant placement.

After this, grafting or additional procedures may be needed.

If replacing the tooth is your plan, please contact us today at {clinic_phone}. We will prioritise your case.

We are here to help you restore chewing and appearance comfortably.`,
        files: []
    }
];

let globalSettings = {
    phone: '',
    name: '',
    owner_name: '',
    clinic_name: '',
    clinic_phone: '',
    email: '',
    clinic_google: '',
    clinic_address: '',
    notes: '',
    follow_up_notes: ''
};

// Quick-send template assignments
let quickWATemplateId = null;
let quickEmailTemplateId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Init calendar state with current month/year
    const now = new Date();
    tasksCalYear = now.getFullYear();
    tasksCalMonth = now.getMonth(); // 0-indexed

    await loadFromStorage();
    renderTemplates();
    renderContacts();
    setupEventListeners();
    setupTabNavigation();
    initScheduledDatePicker();
    restorePosition();
});

// Storage Functions - File-based via API
async function loadFromStorage() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();

        // Load settings
        if (data.globalSettings) {
            globalSettings = data.globalSettings;
            populateFormFromSettings();
        }

        // Load global categories
        if (data.globalCategories && Array.isArray(data.globalCategories)) {
            globalCategories = data.globalCategories;
        }

        // Load contacts
        if (data.savedContacts && Array.isArray(data.savedContacts)) {
            savedContacts = data.savedContacts;
        }

        // Load saved UI position
        if (data.uiPosition) {
            uiPosition = data.uiPosition;
        }

        // Load quick-send template assignments
        if (data.quickWATemplateId !== undefined) quickWATemplateId = data.quickWATemplateId;
        if (data.quickEmailTemplateId !== undefined) quickEmailTemplateId = data.quickEmailTemplateId;

        // Load templates and merge with defaults
        let userTemplates = [];
        if (data.templates && Array.isArray(data.templates)) {
            userTemplates = data.templates;
        }

        // Merge: keep user templates, add any missing default templates
        const mergedTemplates = mergeTemplatesWithDefaults(userTemplates);
        templates = mergedTemplates;

        // Save if new defaults were added
        if (mergedTemplates.length !== userTemplates.length) {
            await saveToStorage();
        }
    } catch (e) {
        console.error('Error loading from storage:', e);
        // Load defaults if server error
        templates = defaultTemplates.map(t => ({ ...t }));
    }
}

// Merge user templates with defaults - keeps user edits, adds new defaults
function mergeTemplatesWithDefaults(userTemplates) {
    const result = [...userTemplates];
    const existingIds = new Set(userTemplates.map(t => t.id));

    // Add any default templates that don't exist yet
    defaultTemplates.forEach(defaultTemplate => {
        if (!existingIds.has(defaultTemplate.id)) {
            result.push({ ...defaultTemplate });
        }
    });

    return result;
}

// Force reload defaults (useful when file changes are made)
async function reloadDefaults() {
    if (confirm('This will add any new default templates. Your custom templates and edits will be kept. Continue?')) {
        templates = mergeTemplatesWithDefaults(templates);
        await saveToStorage();
        renderTemplates();
        showToast('Templates reloaded!');
    }
}

// Reset all templates to defaults (removes custom templates)
async function resetToDefaults() {
    if (confirm('This will DELETE all your custom templates and reset to defaults. Are you sure?')) {
        templates = defaultTemplates.map(t => ({ ...t }));
        await saveToStorage();
        renderTemplates();
        showToast('Templates reset to defaults!');
    }
}

function populateFormFromSettings() {
    Object.keys(globalSettings).forEach(key => {
        if (elements[key]) {
            elements[key].value = globalSettings[key] || '';
        }
    });
}

async function saveToStorage() {
    try {
        const data = {
            globalCategories,
            globalSettings,
            templates,
            savedContacts,
            uiPosition,
            quickWATemplateId,
            quickEmailTemplateId
        };
        await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (e) {
        console.error('Error saving to storage:', e);
    }
}

function updateGlobalSetting(key, value) {
    globalSettings[key] = value;
    // Auto-sync to currently loaded contact so notes/fields persist without needing "Save Contact"
    if (currentContactId) {
        const contact = savedContacts.find(c => c.id === currentContactId);
        if (contact) contact[key] = value;
    }
    saveToStorage();
    savePosition();
}

// Contact Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveContact() {
    const name = globalSettings.name.trim();
    const phone = globalSettings.phone.trim();

    if (!name && !phone) {
        showToast('Please fill in at least name or phone');
        return;
    }

    const contactData = { ...globalSettings };

    if (currentContactId) {
        // Update existing
        const index = savedContacts.findIndex(c => c.id === currentContactId);
        if (index !== -1) {
            savedContacts[index] = {
                ...savedContacts[index],
                ...contactData,
                scheduledDate: currentContactScheduledDate,
                category: currentContactCategory
            };
            showToast('Contact updated!');
        }
    } else {
        // Check if contact with same phone exists
        const existing = savedContacts.find(c => c.phone === phone && phone);
        if (existing) {
            if (confirm('A contact with this phone exists. Update it?')) {
                Object.assign(existing, contactData);
                existing.scheduledDate = currentContactScheduledDate;
                existing.category = currentContactCategory;
                currentContactId = existing.id;
                showToast('Contact updated!');
            } else {
                return;
            }
        } else {
            // Create new
            const newContact = {
                id: generateId(),
                ...contactData,
                scheduledDate: currentContactScheduledDate,
                category: currentContactCategory,
                messageLogs: []
            };
            savedContacts.push(newContact);
            currentContactId = newContact.id;
            showToast('Contact saved!');
        }
    }

    saveToStorage();
    savePosition();
    renderContacts();
}

function loadContact(id) {
    const contact = savedContacts.find(c => c.id === id);
    if (!contact) return;

    currentContactId = id;
    globalSettings = {
        phone: contact.phone || '',
        name: contact.name || '',
        owner_name: contact.owner_name || '',
        clinic_name: contact.clinic_name || '',
        clinic_phone: contact.clinic_phone || '',
        email: contact.email || '',
        clinic_google: contact.clinic_google || '',
        clinic_address: contact.clinic_address || '',
        notes: contact.notes || '',
        follow_up_notes: contact.follow_up_notes || ''
    };

    currentContactScheduledDate = contact.scheduledDate || null;
    currentContactCategory = contact.category || null;
    if (scheduledDatePicker) {
        scheduledDatePicker.setDate(currentContactScheduledDate || '', false);
    }

    populateFormFromSettings();
    saveToStorage();
    savePosition();
    renderContacts();
    showToast('Contact loaded');
}

function deleteContact(id) {
    if (!confirm('Delete this contact?')) return;

    const index = savedContacts.findIndex(c => c.id === id);
    if (index !== -1) {
        savedContacts.splice(index, 1);
        if (currentContactId === id) {
            currentContactId = null;
        }
        saveToStorage();
        renderContacts();
        showToast('Contact deleted');
    }
}

function clearForm() {
    currentContactId = null;
    currentContactScheduledDate = null;
    currentContactCategory = null;
    globalSettings = {
        phone: '',
        name: '',
        owner_name: '',
        clinic_name: '',
        clinic_phone: '',
        email: '',
        clinic_google: '',
        clinic_address: '',
        notes: '',
        follow_up_notes: ''
    };
    populateFormFromSettings();
    if (scheduledDatePicker) {
        scheduledDatePicker.setDate('', false);
    }
    saveToStorage();
    savePosition();
    renderContacts();
}

function filterContacts(query) {
    const q = query.toLowerCase().trim();
    if (!q) return savedContacts;

    return savedContacts.filter(contact => {
        return (contact.name || '').toLowerCase().includes(q) ||
               (contact.phone || '').toLowerCase().includes(q) ||
               (contact.clinic_name || '').toLowerCase().includes(q) ||
               (contact.clinic_phone || '').toLowerCase().includes(q) ||
               (contact.clinic_address || '').toLowerCase().includes(q);
    });
}

function renderContacts(query = '') {
    const contacts = filterContacts(query);

    if (contacts.length === 0) {
        const message = query ? 'No contacts match your search' : 'No saved contacts yet';
        elements.contactsList.innerHTML = `
            <div class="contacts-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p>${message}</p>
            </div>
        `;
        return;
    }

    elements.contactsList.innerHTML = contacts.map(contact => {
        const isActive = contact.id === currentContactId;
        const displayName = contact.clinic_name || contact.name || 'Unnamed';
        const details = [contact.name, contact.phone].filter(Boolean).join(' • ');

        return `
            <div class="contact-item ${isActive ? 'active' : ''}" data-id="${contact.id}">
                <div class="contact-info" onclick="loadContact('${contact.id}')">
                    <div class="contact-name">${escapeHtml(displayName)}</div>
                    <div class="contact-details">${escapeHtml(details) || 'No details'}</div>
                </div>
                <div class="contact-actions">
                    <button class="btn-load-contact" onclick="event.stopPropagation(); loadContact('${contact.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 11 12 14 22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                        Use
                    </button>
                    <button class="btn-delete-contact" onclick="event.stopPropagation(); deleteContact('${contact.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Global contact functions
window.loadContact = loadContact;
window.deleteContact = deleteContact;

// Template Functions
function createTemplate(name, message, files = []) {
    const template = {
        id: generateId(),
        name,
        message,
        files
    };
    templates.push(template);
    saveToStorage();
    return template;
}

function updateTemplate(id, name, message, files) {
    const index = templates.findIndex(t => t.id === id);
    if (index !== -1) {
        templates[index] = { ...templates[index], name, message, files };
        saveToStorage();
        return templates[index];
    }
    return null;
}

function deleteTemplateById(id) {
    const index = templates.findIndex(t => t.id === id);
    if (index !== -1) {
        templates.splice(index, 1);
        saveToStorage();
        return true;
    }
    return false;
}

function getTemplate(id) {
    return templates.find(t => t.id === id);
}

// Variable Replacement
function replaceVariables(message) {
    let result = message;
    const vars = {
        '{name}': globalSettings.name,
        '{owner_name}': globalSettings.owner_name,
        '{clinic_name}': globalSettings.clinic_name,
        '{clinic_phone}': globalSettings.clinic_phone,
        '{email}': globalSettings.email,
        '{clinic_google}': globalSettings.clinic_google,
        '{clinic_address}': globalSettings.clinic_address
    };

    Object.entries(vars).forEach(([placeholder, value]) => {
        result = result.split(placeholder).join(value || '');
    });

    return result;
}

// Normalize any Indian phone format to 91XXXXXXXXXX for wa.me
function normalizeWAPhone(raw) {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.length === 10) return '91' + digits;                   // 9876543210
    if (digits.length === 11 && digits[0] === '0') return '91' + digits.slice(1); // 09876543210
    if (digits.length === 12 && digits.startsWith('91')) return digits; // 919876543210
    if (digits.length === 13 && digits.startsWith('091')) return '91' + digits.slice(3); // 0919876543210 (edge)
    return digits; // fallback: use as-is
}

// WhatsApp URL Generation
function generateWhatsAppUrl(message) {
    const phone = globalSettings.phone.replace(/[^0-9]/g, '');
    const filledMessage = replaceVariables(message);
    const encodedMessage = encodeURIComponent(filledMessage);
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
}

// Email URL (mailto:) Generation
function generateEmailUrl(message, templateName, email) {
    const filled = replaceVariables(message);
    return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(templateName)}&body=${encodeURIComponent(filled)}`;
}

// Replace variables using a contact object instead of globalSettings (for tasks tab)
function replaceVariablesForContact(message, contact) {
    let result = message;
    const vars = {
        '{name}': contact.name,
        '{owner_name}': contact.owner_name,
        '{clinic_name}': contact.clinic_name,
        '{clinic_phone}': contact.clinic_phone,
        '{email}': contact.email,
        '{clinic_google}': contact.clinic_google,
        '{clinic_address}': contact.clinic_address
    };
    Object.entries(vars).forEach(([placeholder, value]) => {
        result = result.split(placeholder).join(value || '');
    });
    return result;
}

// Clipboard Functions
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
        return true;
    } catch (e) {
        console.error('Clipboard error:', e);
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
        return true;
    }
}

// Toast Notification
function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('active');
    setTimeout(() => {
        elements.toast.classList.remove('active');
    }, 2500);
}

// ─── Save / Restore Position ─────────────────────────────────────────────────

const UI_POS_KEY = 'df-ui-position';

async function savePosition(silent = true) {
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'whatsapp';

    let tasksSubView = 'category';
    if (document.getElementById('tasks-day-view')?.style.display !== 'none') tasksSubView = 'day';
    if (document.getElementById('tasks-detail-view')?.style.display !== 'none') tasksSubView = 'detail';

    const pos = {
        tab: activeTab,
        tasksSubView,
        tasksCurrentCat,
        tasksDayViewDate,
        tasksDetailContactId,
        tasksDetailBackView,
        tasksLastContactByCategory,
        tasksLastContactFromCalendar,
        tasksCalYear,
        tasksCalMonth
    };

    // Primary: save to localStorage instantly (device-specific, no network)
    try { localStorage.setItem(UI_POS_KEY, JSON.stringify(pos)); } catch(e) {}

    // Backup: keep server-side copy for cross-device fallback
    uiPosition = pos;
    await saveToStorage();

    if (!silent) {
        showToast('Position saved!');
    }
}

function restorePosition() {
    // Try localStorage first (device-specific, most recent)
    let pos = null;
    try {
        const stored = localStorage.getItem(UI_POS_KEY);
        if (stored) pos = JSON.parse(stored);
    } catch(e) {}

    // Fall back to server-side position (cross-device)
    if (!pos) pos = uiPosition;
    if (!pos) return;

    try {
        if (pos.tasksLastContactByCategory) {
            tasksLastContactByCategory = pos.tasksLastContactByCategory;
        }
        if (pos.tasksLastContactFromCalendar) {
            tasksLastContactFromCalendar = pos.tasksLastContactFromCalendar;
        }

        // Switch to the saved tab
        if (pos.tab) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            const btn = document.querySelector(`.tab-btn[data-tab="${pos.tab}"]`);
            if (btn) btn.classList.add('active');
            const pane = document.getElementById('tab-' + pos.tab);
            if (pane) pane.classList.add('active');
        }

        // Restore tasks navigation state
        if (pos.tab === 'tasks') {
            tasksCurrentCat = pos.tasksCurrentCat || '__calendar__';
            tasksDayViewDate = pos.tasksDayViewDate || null;
            tasksDetailContactId = pos.tasksDetailContactId || null;
            tasksDetailBackView = pos.tasksDetailBackView || 'day';

            if (pos.tasksCalYear) tasksCalYear = pos.tasksCalYear;
            if (pos.tasksCalMonth !== undefined) tasksCalMonth = pos.tasksCalMonth;

            renderTasksView();

            if (pos.tasksSubView === 'day' && tasksDayViewDate) {
                showTasksSubView('day');
                renderDayView();
            } else if (pos.tasksSubView === 'detail' && tasksDetailContactId) {
                showTasksSubView('detail');
                renderTasksDetail();
            }
        }
    } catch (e) {
        console.error('Error restoring position:', e);
    }
}

// ────────────────────────────────────────────────────────────────────────────

// Check if file is an image based on extension
function isImageFile(filename) {
    if (!filename) return false;
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
}

// Render Functions
function renderTemplates() {
    if (templates.length === 0) {
        elements.templatesGrid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <p>No templates yet. Click "Add Template" to create one.</p>
            </div>
        `;
        return;
    }

    elements.templatesGrid.innerHTML = templates.map(template => {
        const previewText = template.message.length > 60
            ? template.message.substring(0, 60) + '...'
            : template.message;

        const fileButtons = (template.files || []).map((file, index) => {
            const isImage = isImageFile(file.filename);
            if (isImage) {
                return `
                    <button class="btn-copy" onclick="event.stopPropagation(); copyFile('${template.id}', ${index})" title="Copy image to clipboard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        ${escapeHtml(file.label || 'Image')}
                    </button>
                `;
            } else {
                return `
                    <button class="btn-open" onclick="event.stopPropagation(); openFolder('${template.id}', ${index})" title="Open in Explorer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        ${escapeHtml(file.label || 'File')}
                    </button>
                `;
            }
        }).join('');

        return `
            <div class="template-chip" data-id="${template.id}" draggable="true">
                <div class="drag-handle" title="Drag to reorder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                </div>
                <div class="template-info" onclick="openEditModal('${template.id}')">
                    <div class="template-name">${escapeHtml(template.name)}</div>
                    <div class="template-preview">${escapeHtml(previewText)}</div>
                </div>
                <div class="template-actions">
                    <button class="btn-send" onclick="event.stopPropagation(); sendMessage('${template.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        WA
                    </button>
                    <button class="btn-email" onclick="event.stopPropagation(); sendEmailFromTemplate('${template.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        Email
                    </button>
                    ${fileButtons}
                    <button class="btn-edit" onclick="event.stopPropagation(); openEditModal('${template.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    initTemplateDrag();
}

function initTemplateDrag() {
    const grid = elements.templatesGrid;
    let dragSrcId = null;

    grid.querySelectorAll('.template-chip').forEach(chip => {
        chip.addEventListener('dragstart', e => {
            dragSrcId = chip.dataset.id;
            chip.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        chip.addEventListener('dragend', () => {
            chip.classList.remove('dragging');
            grid.querySelectorAll('.template-chip').forEach(c => c.classList.remove('drag-over'));
        });

        chip.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (chip.dataset.id !== dragSrcId) {
                grid.querySelectorAll('.template-chip').forEach(c => c.classList.remove('drag-over'));
                chip.classList.add('drag-over');
            }
        });

        chip.addEventListener('dragleave', () => {
            chip.classList.remove('drag-over');
        });

        chip.addEventListener('drop', e => {
            e.preventDefault();
            chip.classList.remove('drag-over');
            if (!dragSrcId || chip.dataset.id === dragSrcId) return;

            const srcIndex = templates.findIndex(t => t.id === dragSrcId);
            const dstIndex = templates.findIndex(t => t.id === chip.dataset.id);
            if (srcIndex === -1 || dstIndex === -1) return;

            const [moved] = templates.splice(srcIndex, 1);
            templates.splice(dstIndex, 0, moved);

            saveToStorage();
            renderTemplates();
        });
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modal Functions
function openModal(isNew = true) {
    elements.modalOverlay.classList.add('active');
    elements.modalTitle.textContent = isNew ? 'New Template' : 'Edit Template';
    elements.deleteTemplate.style.display = isNew ? 'none' : 'flex';

    if (isNew) {
        currentTemplateId = null;
        elements.templateName.value = '';
        elements.templateMessage.value = '';
        currentTemplateFiles = [];
        renderFileEntries(currentTemplateFiles);
    }
}

function closeModal() {
    elements.modalOverlay.classList.remove('active');
    currentTemplateId = null;
}

function openEditModal(id) {
    const template = getTemplate(id);
    if (!template) return;

    currentTemplateId = id;
    elements.templateName.value = template.name;
    elements.templateMessage.value = template.message;
    currentTemplateFiles = (template.files || []).map(f => ({ ...f }));
    renderFileEntries(currentTemplateFiles);
    openModal(false);
}

function renderFileEntries(files) {
    if (files.length === 0) {
        elements.filesList.innerHTML = '<p style="color: var(--gray-500); font-size: 0.85rem; text-align: center; padding: 12px;">No files attached. Click "Add File" to add one.</p>';
        return;
    }

    elements.filesList.innerHTML = files.map((file, index) => `
        <div class="file-entry" data-index="${index}">
            <input type="text" class="file-label" placeholder="Label" value="${escapeHtml(file.label || '')}">
            <input type="text" class="file-path" placeholder="C:\\Users\\...\\file.mp4" value="${escapeHtml(file.path || '')}">
            <button class="btn-remove-file" onclick="removeFileEntry(${index})" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Temporary storage for files being edited
let currentTemplateFiles = [];

function getFileEntriesFromForm() {
    const entries = elements.filesList.querySelectorAll('.file-entry');
    const files = [];
    entries.forEach(entry => {
        let label = entry.querySelector('.file-label')?.value?.trim() || '';
        let path = entry.querySelector('.file-path')?.value?.trim() || '';

        // Clean up path - remove quotes if present
        path = path.replace(/^["']|["']$/g, '');

        if (path) {
            // Extract filename from path for label if not set
            const filename = path.split(/[\\\/]/).pop();
            if (!label) {
                label = filename.split('.')[0]; // Use filename without extension
            }

            files.push({
                label: label,
                path: path,
                filename: filename
            });
        }
    });
    return files;
}

function addFileEntry() {
    // Add empty file entry
    currentTemplateFiles.push({ label: '', path: '', filename: '' });
    renderFileEntries(currentTemplateFiles);

    // Focus the new path input
    setTimeout(() => {
        const entries = elements.filesList.querySelectorAll('.file-entry');
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
            lastEntry.querySelector('.file-path')?.focus();
        }
    }, 50);
}

function removeFileEntry(index) {
    // Read current values from form first
    currentTemplateFiles = getFileEntriesFromForm();
    currentTemplateFiles.splice(index, 1);
    renderFileEntries(currentTemplateFiles);
}

// Copy file - for images, tries clipboard; otherwise opens folder
window.copyFile = async function(templateId, fileIndex) {
    // Just open the folder - simpler and always works
    window.openFolder(templateId, fileIndex);
};

// Open folder in Windows Explorer (uses saved path, works after restart)
window.openFolder = async function(templateId, fileIndex) {
    const template = getTemplate(templateId);
    const fileData = template?.files?.[fileIndex];

    if (!fileData?.path) {
        showToast('No file path available');
        return;
    }

    try {
        // Use GET request with query parameter
        const url = '/api/open-folder?path=' + encodeURIComponent(fileData.path);
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            showToast('Opened in Explorer');
        } else {
            // Fallback: copy the path
            await copyToClipboard(fileData.path);
            showToast('Could not open - copied path instead');
        }
    } catch (e) {
        console.error('Error opening folder:', e);
        // Fallback: copy the path
        await copyToClipboard(fileData.path);
        showToast('Server error - copied path instead');
    }
};

// Legacy function for backward compatibility
window.copyFilePath = async function(path) {
    await copyToClipboard(path);
};

// Global function for send button
window.sendMessage = function(id) {
    const template = getTemplate(id);
    if (!template) return;

    if (!globalSettings.phone) {
        showToast('Please enter a phone number first!');
        return;
    }

    const url = generateWhatsAppUrl(template.message);
    window.open(url, '_blank');

    // Log message send to contact
    if (currentContactId) {
        const contact = savedContacts.find(c => c.id === currentContactId);
        if (contact) {
            if (!Array.isArray(contact.messageLogs)) contact.messageLogs = [];
            contact.messageLogs.push({ templateName: template.name, sentAt: new Date().toISOString() });
            saveToStorage();
        }
    }
};

// Send WhatsApp template scoped to a specific contact (tasks tab)
window.sendMessageToContact = function(templateId, contactId) {
    const template = getTemplate(templateId);
    const contact = savedContacts.find(c => c.id === contactId);
    if (!template || !contact) return;

    const phone = normalizeWAPhone(contact.phone || contact.clinic_phone || '');
    if (!phone) { showToast('No phone number for this contact'); return; }

    const filled = replaceVariablesForContact(template.message, contact);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(filled)}`;
    window.open(url, '_blank');

    if (!Array.isArray(contact.messageLogs)) contact.messageLogs = [];
    contact.messageLogs.push({ templateName: template.name, sentAt: new Date().toISOString(), channel: 'whatsapp' });
    saveToStorage();
    renderTasksDetail();
};

// Send Email template scoped to a specific contact (tasks tab)
window.sendEmailToContact = function(templateId, contactId) {
    const template = getTemplate(templateId);
    const contact = savedContacts.find(c => c.id === contactId);
    if (!template || !contact) return;

    if (!contact.email) { showToast('No email for this contact'); return; }

    const filled = replaceVariablesForContact(template.message, contact);
    const url = `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(template.name)}&body=${encodeURIComponent(filled)}`;
    window.open(url, '_blank');

    if (!Array.isArray(contact.messageLogs)) contact.messageLogs = [];
    contact.messageLogs.push({ templateName: template.name, sentAt: new Date().toISOString(), channel: 'email' });
    saveToStorage();
    renderTasksDetail();
};

// Send Email template from WhatsApp tab (uses globalSettings)
window.sendEmailFromTemplate = function(id) {
    const template = getTemplate(id);
    if (!template) return;

    if (!globalSettings.email) {
        showToast('Please enter an email address first!');
        return;
    }

    const url = generateEmailUrl(template.message, template.name, globalSettings.email);
    window.open(url, '_blank');

    if (currentContactId) {
        const contact = savedContacts.find(c => c.id === currentContactId);
        if (contact) {
            if (!Array.isArray(contact.messageLogs)) contact.messageLogs = [];
            contact.messageLogs.push({ templateName: template.name, sentAt: new Date().toISOString(), channel: 'email' });
            saveToStorage();
        }
    }
};

// Quick-send WA from task row using assigned template
window.quickSendWA = function(contactId) {
    if (!quickWATemplateId) { showToast('No quick WA template assigned'); return; }
    window.sendMessageToContact(quickWATemplateId, contactId);
};

// Quick-send Email from task row using assigned template
window.quickSendEmail = function(contactId) {
    if (!quickEmailTemplateId) { showToast('Set a Quick Email template in the Tasks header first'); return; }
    window.sendEmailToContact(quickEmailTemplateId, contactId);
};

// Global function for edit button
window.openEditModal = openEditModal;
window.removeFileEntry = removeFileEntry;

// ─── Tab Navigation ─────────────────────────────────────────────────────────

function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            // Toggle active button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle active pane
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            const pane = document.getElementById('tab-' + tab);
            if (pane) pane.classList.add('active');

            // Re-render tasks when switching to tasks tab
            if (tab === 'tasks') {
                renderTasksView();
            }
            savePosition();
        });
    });
}

// ─── Scheduled Date Picker ───────────────────────────────────────────────────

function initScheduledDatePicker() {
    const container = document.getElementById('scheduledDatePicker');
    if (!container || typeof flatpickr === 'undefined') return;

    scheduledDatePicker = flatpickr(container, {
        inline: true,
        dateFormat: 'Y-m-d',
        onChange: function(selectedDates, dateStr) {
            currentContactScheduledDate = dateStr || null;
            // Auto-save to current contact if one is loaded
            if (currentContactId) {
                const contact = savedContacts.find(c => c.id === currentContactId);
                if (contact) {
                    contact.scheduledDate = currentContactScheduledDate;
                    saveToStorage();
                }
            }
        }
    });

    // Clear date button
    document.getElementById('clearScheduledDate')?.addEventListener('click', () => {
        currentContactScheduledDate = null;
        if (scheduledDatePicker) scheduledDatePicker.setDate('', false);
        if (currentContactId) {
            const contact = savedContacts.find(c => c.id === currentContactId);
            if (contact) {
                contact.scheduledDate = null;
                saveToStorage();
            }
        }
    });
}

// ─── Tasks Tab ───────────────────────────────────────────────────────────────

function renderTasksView() {
    renderCategorySelector();
    renderQuickSendSelectors();
    if (tasksCurrentCat === '__calendar__') {
        showCalendar();
    } else {
        showCategoryList();
    }
}

function renderQuickSendSelectors() {
    const container = document.getElementById('tasksQuickSendRow');
    if (!container) return;

    const noneOpt = `<option value="">— None —</option>`;
    const templateOpts = templates.map(t =>
        `<option value="${escapeHtml(t.id)}" ${t.id === quickWATemplateId ? 'selected' : ''}>${escapeHtml(t.name)}</option>`
    ).join('');
    const emailOpts = templates.map(t =>
        `<option value="${escapeHtml(t.id)}" ${t.id === quickEmailTemplateId ? 'selected' : ''}>${escapeHtml(t.name)}</option>`
    ).join('');

    container.innerHTML = `
        <div class="quick-send-item">
            <label class="quick-send-label">
                <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Quick WA
            </label>
            <select class="quick-send-select" id="quickWATemplateSelect" onchange="setQuickWATemplate(this.value)">
                ${noneOpt}${templateOpts}
            </select>
        </div>
        <div class="quick-send-item">
            <label class="quick-send-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                Quick Email
            </label>
            <select class="quick-send-select" id="quickEmailTemplateSelect" onchange="setQuickEmailTemplate(this.value)">
                ${noneOpt}${emailOpts}
            </select>
        </div>
    `;
}

window.setQuickWATemplate = function(id) {
    quickWATemplateId = id || null;
    saveToStorage();
    showToast(id ? 'Quick WA template set' : 'Quick WA template cleared');
};

window.setQuickEmailTemplate = function(id) {
    quickEmailTemplateId = id || null;
    saveToStorage();
    showToast(id ? 'Quick Email template set' : 'Quick Email template cleared');
};

function showTasksSubView(view) {
    const views = ['category', 'day', 'detail'];
    views.forEach(v => {
        const el = document.getElementById('tasks-' + v + '-view');
        if (el) el.style.display = v === view ? '' : 'none';
    });
    savePosition();
}

function renderCategorySelector() {
    const container = document.getElementById('categorySelector');
    if (!container) return;

    const calActive = tasksCurrentCat === '__calendar__';

    let html = `
        <button class="category-btn ${calActive ? 'active' : ''}" onclick="selectTasksCategory('__calendar__')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Calendar
        </button>
    `;

    // Built-in OTHER category
    const otherActive = tasksCurrentCat === 'OTHER';
    html += `
    <span class="category-btn-wrap">
        <button class="category-btn ${otherActive ? 'active' : ''}" onclick="selectTasksCategory('OTHER')">OTHER</button>
        <button class="cat-list-btn" onclick="event.stopPropagation(); showCategoryListFor('OTHER')" title="View all contacts in OTHER">☰</button>
    </span>`;

    globalCategories.forEach(cat => {
        const isActive = tasksCurrentCat === cat;
        const catEsc = escapeHtml(cat);
        html += `
        <span class="category-btn-wrap">
            <button class="category-btn ${isActive ? 'active' : ''}" onclick="selectTasksCategory('${catEsc}')">${catEsc}</button>
            <button class="cat-list-btn" onclick="event.stopPropagation(); showCategoryListFor('${catEsc}')" title="View all contacts in ${catEsc}">☰</button>
            <span class="cat-delete-x" onclick="event.stopPropagation(); deleteCategory('${catEsc}')" title="Delete category">✕</span>
        </span>`;
    });

    container.innerHTML = html;
}

window.showCategoryListFor = function(cat) {
    tasksCurrentCat = cat;
    renderCategorySelector();
    showTasksSubView('category');
    showCategoryList();
};

window.selectTasksCategory = function(cat) {
    tasksCurrentCat = cat;
    renderCategorySelector();

    if (cat === '__calendar__') {
        // If there's a last contact viewed via calendar, jump straight to it
        if (tasksLastContactFromCalendar) {
            const contact = savedContacts.find(c => c.id === tasksLastContactFromCalendar);
            if (contact) {
                if (contact.scheduledDate) tasksDayViewDate = contact.scheduledDate;
                openTasksDetail(contact.id, 'day');
                savePosition();
                return;
            }
        }
        showTasksSubView('category');
        showCalendar();
    } else {
        // Try last contact first, then fall back to first contact in category
        const lastContactId = tasksLastContactByCategory[cat];
        let contact = lastContactId ? savedContacts.find(c => c.id === lastContactId) : null;

        // Validate last contact still belongs to this category
        if (contact) {
            const belongs = cat === 'OTHER'
                ? (!contact.category || contact.category === 'OTHER')
                : contact.category === cat;
            if (!belongs) contact = null;
        }

        // Fall back to first contact in this category (skip the list view)
        if (!contact) {
            contact = savedContacts.find(c =>
                cat === 'OTHER'
                    ? (!c.category || c.category === 'OTHER')
                    : c.category === cat
            );
        }

        if (contact) {
            openTasksDetail(contact.id, 'category');
        } else {
            // Category is empty – show empty state
            showTasksSubView('category');
            showCategoryList();
        }
    }
    savePosition();
};

window.deleteCategory = function(cat) {
    if (!confirm(`Delete category "${cat}"?\n\nAll contacts in this category will be moved to OTHER.`)) return;
    savedContacts.forEach(c => {
        if (c.category === cat) c.category = 'OTHER';
    });
    globalCategories = globalCategories.filter(c => c !== cat);
    if (tasksCurrentCat === cat) {
        tasksCurrentCat = 'OTHER';
    }
    saveToStorage();
    renderCategorySelector();
    // Re-render current sub-view
    const detailEl = document.getElementById('tasks-detail-view');
    if (detailEl && detailEl.style.display !== 'none') {
        renderTasksDetail();
    } else if (tasksCurrentCat !== '__calendar__') {
        showCategoryList();
    }
    showToast(`Category "${cat}" deleted. Contacts moved to OTHER.`);
};

function showCalendar() {
    document.getElementById('tasks-calendar-container').style.display = '';
    document.getElementById('tasks-category-list-container').style.display = 'none';
    renderCalendar();
}

function showCategoryList() {
    document.getElementById('tasks-calendar-container').style.display = 'none';
    document.getElementById('tasks-category-list-container').style.display = '';
    renderCategoryContactList(tasksCurrentCat);
}

function renderCalendar() {
    const container = document.getElementById('tasks-calendar-container');
    if (!container) return;

    const year = tasksCalYear;
    const month = tasksCalMonth;

    // Build map: dateStr -> contacts
    const dateMap = {};
    savedContacts.forEach(c => {
        if (c.scheduledDate) {
            if (!dateMap[c.scheduledDate]) dateMap[c.scheduledDate] = [];
            dateMap[c.scheduledDate].push(c);
        }
    });

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayHeaders = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const todayStr = new Date().toISOString().slice(0, 10);

    // Day header cells
    const dayHeaderCells = dayHeaders.map(d => `<div class="cal-day-header">${d}</div>`).join('');

    // Day cells
    let cells = '';
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        cells += '<div class="cal-cell empty"></div>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const hasEvents = !!dateMap[dateStr];
        const isToday = dateStr === todayStr;
        cells += `
            <div class="cal-cell ${hasEvents ? 'has-events' : ''} ${isToday ? 'today' : ''}" onclick="openDayView('${dateStr}')">
                <span>${d}</span>
                ${hasEvents ? `<span class="cal-dot" title="${dateMap[dateStr].length} contact(s)"></span>` : ''}
            </div>
        `;
    }

    container.innerHTML = `
        <div class="tasks-calendar">
            <div class="cal-nav">
                <button class="btn-tasks-nav" id="calPrevMonth">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span class="cal-month-label">${monthNames[month]} ${year}</span>
                <button class="btn-tasks-nav" id="calNextMonth">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
            </div>
            <div class="cal-grid">
                ${dayHeaderCells}
                ${cells}
            </div>
        </div>
    `;

    // Attach nav listeners
    document.getElementById('calPrevMonth')?.addEventListener('click', () => {
        tasksCalMonth--;
        if (tasksCalMonth < 0) { tasksCalMonth = 11; tasksCalYear--; }
        renderCalendar();
        savePosition();
    });
    document.getElementById('calNextMonth')?.addEventListener('click', () => {
        tasksCalMonth++;
        if (tasksCalMonth > 11) { tasksCalMonth = 0; tasksCalYear++; }
        renderCalendar();
        savePosition();
    });
}

window.openDayView = function(isoDate) {
    tasksDayViewDate = isoDate;
    showTasksSubView('day');
    renderDayView();
    savePosition();
};

function renderDayView() {
    const contacts = savedContacts.filter(c => c.scheduledDate === tasksDayViewDate);
    const titleEl = document.getElementById('tasksDayTitle');
    if (titleEl) {
        const d = new Date(tasksDayViewDate + 'T00:00:00');
        titleEl.textContent = d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    }
    const listEl = document.getElementById('tasksDayList');
    if (listEl) {
        listEl.innerHTML = renderContactRows(contacts, 'day');
    }
}

function renderCategoryContactList(cat) {
    const container = document.getElementById('tasks-category-list-container');
    if (!container) return;
    const contacts = savedContacts.filter(c => c.category === cat);
    container.innerHTML = `<div class="tasks-contact-list">${renderContactRows(contacts, 'category')}</div>`;
}

function renderContactRows(contacts, mode) {
    if (contacts.length === 0) {
        return `<div class="tasks-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
            </svg>
            <p>No contacts scheduled here</p>
        </div>`;
    }

    return contacts.map(contact => {
        const clinicName = escapeHtml(contact.clinic_name || 'Unknown Clinic');
        const ownerName = escapeHtml(contact.name || '');
        const phone = escapeHtml(contact.phone || contact.clinic_phone || '');
        const rawPhone = (contact.phone || contact.clinic_phone || '').replace(/[^0-9+]/g, '');
        const waPhone = normalizeWAPhone(contact.phone || contact.clinic_phone || '');
        const contactEmail = contact.email || '';
        const backView = mode === 'day' ? 'day' : 'category';

        const waSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;
        const emailSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

        const waBtn = waPhone
            ? (quickWATemplateId
                ? `<button class="btn-wa" onclick="quickSendWA('${contact.id}')">${waSvg} WA</button>`
                : `<a class="btn-wa" href="https://wa.me/${waPhone}" target="_blank">${waSvg} WA</a>`)
            : '';

        const gmailBtn = `<button class="btn-email" onclick="quickSendEmail('${contact.id}')">${emailSvg} Gmail</button>`;

        return `
            <div class="tasks-contact-row">
                <div class="tasks-row-info">
                    <div class="tasks-row-clinic">${clinicName}</div>
                    <div class="tasks-row-sub">${ownerName}${ownerName && phone ? ' · ' : ''}${phone}</div>
                </div>
                <div class="tasks-row-actions">
                    ${rawPhone ? `<a class="btn-call" href="tel:${rawPhone}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        Call
                    </a>` : ''}
                    ${waBtn}
                    ${gmailBtn}
                    <button class="btn-open-contact" onclick="openTasksDetail('${contact.id}', '${backView}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Open
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.openTasksDetail = function(id, backView) {
    tasksDetailContactId = id;
    tasksDetailBackView = backView || 'day';
    tasksDetailEditMode = false;

    // Track last contact per navigation path
    if (tasksDetailBackView === 'category' && tasksCurrentCat) {
        tasksLastContactByCategory[tasksCurrentCat] = id;
    } else {
        const contact = savedContacts.find(c => c.id === id);
        if (contact && contact.category) {
            tasksLastContactByCategory[contact.category] = id;
        } else if (contact && !contact.category) {
            tasksLastContactByCategory['OTHER'] = id;
        }
    }

    // Track last contact viewed via calendar path
    if (tasksDetailBackView === 'day') {
        tasksLastContactFromCalendar = id;
    }

    showTasksSubView('detail');
    renderTasksDetail();
    savePosition();
};

function renderDetailTemplatesSection(contactId) {
    const contact = savedContacts.find(c => c.id === contactId);
    if (!contact) return '';

    const hasPhone = !!normalizeWAPhone(contact.phone || contact.clinic_phone || '');
    const hasEmail = !!contact.email;

    if (!hasPhone && !hasEmail) return '';

    const waSvg = `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;
    const emailSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

    const rows = templates.map(t => {
        const waBtn = hasPhone
            ? `<button class="btn-wa btn-sm" onclick="sendMessageToContact('${t.id}','${contactId}')">${waSvg} WA</button>`
            : '';
        const emailBtn = hasEmail
            ? `<button class="btn-email btn-sm" onclick="sendEmailToContact('${t.id}','${contactId}')">${emailSvg} Email</button>`
            : '';
        return `
            <div class="detail-template-row">
                <span class="detail-template-name">${escapeHtml(t.name)}</span>
                <div class="detail-template-btns">${waBtn}${emailBtn}</div>
            </div>`;
    }).join('');

    return `
        <div class="detail-section detail-templates-section">
            <h4>Send Template</h4>
            <div class="detail-templates-list">${rows}</div>
        </div>`;
}

function renderTasksDetail() {
    const contact = savedContacts.find(c => c.id === tasksDetailContactId);
    const container = document.getElementById('tasksDetailContent');
    if (!contact || !container) return;

    const id = contact.id;

    const logs = (contact.messageLogs || []).slice().reverse();
    const logsHtml = logs.length === 0
        ? '<p class="tasks-empty-inline">No messages sent yet.</p>'
        : logs.map(log => {
            const dt = new Date(log.sentAt);
            const dateStr = dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            const timeStr = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            return `<div class="msg-log-row">
                <span class="msg-log-name">${escapeHtml(log.templateName)}</span>
                <span class="msg-log-time">${dateStr} ${timeStr}</span>
            </div>`;
        }).join('');

    const currentCat = contact.category || '';
    const allCatOptions = ['', 'OTHER', ...globalCategories];
    const catOptions = allCatOptions.map(cat =>
        `<option value="${escapeHtml(cat)}" ${cat === currentCat ? 'selected' : ''}>${cat ? escapeHtml(cat) : '— None —'}</option>`
    ).join('');

    const notesVal = escapeHtml(contact.notes || '');
    const followUpNotesVal = escapeHtml(contact.follow_up_notes || '');

    // ── Contact switcher pill + call button row ───────────────────────────
    const detailList = getTasksDetailList();
    const detailIdx  = detailList.findIndex(c => c.id === id);
    const rawDetailPhone = (contact.phone || contact.clinic_phone || '').replace(/[^0-9+]/g, '');
    const waDetailPhone = normalizeWAPhone(contact.phone || contact.clinic_phone || '');

    const pillHtml = detailList.length > 1 ? `
        <div class="detail-nav">
            <button class="btn-tasks-nav detail-nav-btn" onclick="navigateDetailContact(-1)"${detailIdx <= 0 ? ' disabled' : ''}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="detail-nav-label">Contact ${detailIdx + 1} of ${detailList.length}</span>
            <button class="btn-tasks-nav detail-nav-btn" onclick="navigateDetailContact(1)"${detailIdx >= detailList.length - 1 ? ' disabled' : ''}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
        </div>` : '';

    const detailWABtn = waDetailPhone
        ? (quickWATemplateId
            ? `<button class="btn-wa btn-call-detail" onclick="quickSendWA('${id}')">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                WA
              </button>`
            : `<a class="btn-wa btn-call-detail" href="https://wa.me/${waDetailPhone}" target="_blank">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                WA
              </a>`)
        : '';

    const detailGmailBtn = `<button class="btn-email btn-call-detail" onclick="quickSendEmail('${id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
        </svg>
        Gmail
    </button>`;

    const navigatorHtml = `
        <div class="detail-nav-row">
            ${pillHtml}
            ${rawDetailPhone ? `<a class="btn-call btn-call-detail" href="tel:${rawDetailPhone}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Call
            </a>` : ''}
            ${detailWABtn}
            ${detailGmailBtn}
        </div>`;

    // ── Category & history HTML (shared between both modes) ──────────────
    const canDeleteCat = currentCat && currentCat !== 'OTHER' && globalCategories.includes(currentCat);
    const categoryHtml = `
        <div class="detail-section">
            <h4>Category</h4>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <select class="detail-cat-select" onchange="updateContactCategory('${id}', this.value)">
                    ${catOptions}
                </select>
                ${canDeleteCat ? `<button class="btn-delete-category" onclick="deleteCategory('${escapeHtml(currentCat)}')" title="Delete this category from all contacts">✕ Delete</button>` : ''}
                <button class="btn-add-category" onclick="promptAddCategoryFromDetail('${id}')">+ New Category</button>
            </div>
        </div>`;

    const historyHtml = `
        <div class="detail-section">
            <h4>Message History</h4>
            ${logsHtml}
        </div>`;

    // ── Notes (always editable – shared between both modes) ──────────────
    const notesHtml = `
        <div class="detail-section">
            <h4>Notes <span class="detail-notes-hint">— auto-saves on blur</span></h4>
            <textarea class="detail-notes-input" id="detailNotesInput"
                placeholder="Add notes about this contact...">${notesVal}</textarea>
        </div>`;

    const followUpNotesHtml = `
        <div class="detail-section">
            <h4>Follow Up Notes <span class="detail-notes-hint">— auto-saves on blur</span></h4>
            <textarea class="detail-notes-input detail-followup-notes-input" id="detailFollowUpNotesInput"
                placeholder="Follow up notes about this contact...">${followUpNotesVal}</textarea>
        </div>`;

    if (tasksDetailEditMode) {
        // ── EDIT MODE ────────────────────────────────────────────────────
        container.innerHTML = navigatorHtml + followUpNotesHtml + `
            <div class="detail-fields detail-edit-mode">
                <div class="detail-field-edit">
                    <label>Clinic Name</label>
                    <input id="de-clinic_name" value="${escapeHtml(contact.clinic_name || '')}">
                </div>
                <div class="detail-field-edit">
                    <label>Owner / Name</label>
                    <input id="de-name" value="${escapeHtml(contact.name || '')}">
                </div>
                <div class="detail-field-edit">
                    <label>Clinic Phone</label>
                    <input id="de-clinic_phone" value="${escapeHtml(contact.clinic_phone || '')}">
                </div>
                <div class="detail-field-edit">
                    <label>WhatsApp Phone</label>
                    <input id="de-phone" value="${escapeHtml(contact.phone || '')}">
                </div>
                <div class="detail-field-edit">
                    <label>Clinic Address</label>
                    <input id="de-clinic_address" value="${escapeHtml(contact.clinic_address || '')}">
                </div>
                <div class="detail-field-edit">
                    <label>Email</label>
                    <input id="de-email" type="email" value="${escapeHtml(contact.email || '')}">
                </div>
                <div class="detail-field-edit">
                    <label>Google Maps Link</label>
                    <input id="de-clinic_google" value="${escapeHtml(contact.clinic_google || '')}">
                </div>
                <div class="detail-edit-actions">
                    <button class="btn-detail-save" onclick="saveDetailEdits('${id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        Save Changes
                    </button>
                    <button class="btn-detail-cancel" onclick="cancelDetailEdit()">Cancel</button>
                </div>
            </div>
            ${notesHtml}
            ${categoryHtml}
            ${historyHtml}
            ${renderDetailTemplatesSection(id)}
        `;
    } else {
        // ── READ MODE ────────────────────────────────────────────────────
        container.innerHTML = navigatorHtml + followUpNotesHtml + `
            <div class="detail-fields">
                <div class="detail-fields-header">
                    <button class="btn-detail-edit" onclick="enterDetailEditMode()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit Details
                    </button>
                </div>
                <div class="detail-field"><strong>Clinic</strong><span>${escapeHtml(contact.clinic_name || '—')}</span></div>
                <div class="detail-field"><strong>Owner / Name</strong><span>${escapeHtml(contact.name || '—')}</span></div>
                <div class="detail-field"><strong>Clinic Phone</strong><span>${escapeHtml(contact.clinic_phone || '—')}</span></div>
                <div class="detail-field"><strong>WhatsApp</strong><span>${escapeHtml(contact.phone || '—')}</span></div>
                <div class="detail-field"><strong>Email</strong><span>${escapeHtml(contact.email || '—')}</span></div>
                <div class="detail-field"><strong>Address</strong><span>${escapeHtml(contact.clinic_address || '—')}</span></div>
                <div class="detail-field"><strong>Scheduled Date</strong><span>${escapeHtml(contact.scheduledDate || '—')}</span></div>
            </div>
            ${notesHtml}
            ${categoryHtml}
            ${historyHtml}
            ${renderDetailTemplatesSection(id)}
        `;
    }

    // Attach notes auto-save on blur (works for both modes since notes HTML is shared)
    const notesInput = document.getElementById('detailNotesInput');
    if (notesInput) {
        notesInput.addEventListener('blur', (e) => {
            saveDetailNotes(id, e.target.value);
        });
    }

    const followUpNotesInput = document.getElementById('detailFollowUpNotesInput');
    if (followUpNotesInput) {
        const autoResize = (el) => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
        autoResize(followUpNotesInput);
        followUpNotesInput.addEventListener('input', () => autoResize(followUpNotesInput));
        followUpNotesInput.addEventListener('blur', (e) => {
            saveDetailFollowUpNotes(id, e.target.value);
        });
    }
}

window.enterDetailEditMode = function() {
    tasksDetailEditMode = true;
    renderTasksDetail();
};

window.cancelDetailEdit = function() {
    tasksDetailEditMode = false;
    renderTasksDetail();
};

function getTasksDetailList() {
    if (tasksDetailBackView === 'day') {
        return savedContacts.filter(c => c.scheduledDate === tasksDayViewDate);
    } else if (tasksDetailBackView === 'category') {
        return savedContacts.filter(c => c.category === tasksCurrentCat);
    }
    return [];
}

window.navigateDetailContact = function(dir) {
    const list = getTasksDetailList();
    const idx = list.findIndex(c => c.id === tasksDetailContactId);
    const next = idx + dir;
    if (next >= 0 && next < list.length) {
        tasksDetailContactId = list[next].id;
        tasksDetailEditMode = false;
        // Keep "last viewed" tracking in sync as user navigates
        if (tasksDetailBackView === 'category' && tasksCurrentCat) {
            tasksLastContactByCategory[tasksCurrentCat] = tasksDetailContactId;
        } else if (tasksDetailBackView === 'day') {
            tasksLastContactFromCalendar = tasksDetailContactId;
        }
        savePosition();
        renderTasksDetail();
    }
};

window.saveDetailEdits = function(id) {
    const contact = savedContacts.find(c => c.id === id);
    if (!contact) return;

    // Save notes first (it's in the DOM during edit mode too)
    const notesInput = document.getElementById('detailNotesInput');
    if (notesInput) contact.notes = notesInput.value;

    const followUpNotesInput = document.getElementById('detailFollowUpNotesInput');
    if (followUpNotesInput) contact.follow_up_notes = followUpNotesInput.value;

    const fieldMap = {
        clinic_name: 'de-clinic_name',
        name: 'de-name',
        clinic_phone: 'de-clinic_phone',
        phone: 'de-phone',
        email: 'de-email',
        clinic_address: 'de-clinic_address',
        clinic_google: 'de-clinic_google'
    };
    Object.entries(fieldMap).forEach(([field, inputId]) => {
        const input = document.getElementById(inputId);
        if (input) contact[field] = input.value;
    });

    // Sync to globalSettings + form if this is the currently loaded contact
    if (currentContactId === id) {
        Object.assign(globalSettings, {
            clinic_name: contact.clinic_name,
            name: contact.name,
            clinic_phone: contact.clinic_phone,
            phone: contact.phone,
            email: contact.email,
            clinic_address: contact.clinic_address,
            clinic_google: contact.clinic_google,
            notes: contact.notes,
            follow_up_notes: contact.follow_up_notes
        });
        populateFormFromSettings();
    }

    saveToStorage();
    showToast('Contact updated');
    tasksDetailEditMode = false;
    renderTasksDetail();
    renderContacts();
};

function saveDetailNotes(id, notes) {
    const contact = savedContacts.find(c => c.id === id);
    if (!contact || contact.notes === notes) return;
    contact.notes = notes;
    // Sync back to the WhatsApp tab form if this contact is currently loaded there
    if (currentContactId === id) {
        globalSettings.notes = notes;
        if (elements.notes) elements.notes.value = notes;
    }
    saveToStorage();
    showToast('Notes saved');
}

function saveDetailFollowUpNotes(id, notes) {
    const contact = savedContacts.find(c => c.id === id);
    if (!contact || contact.follow_up_notes === notes) return;
    contact.follow_up_notes = notes;
    if (currentContactId === id) {
        globalSettings.follow_up_notes = notes;
        if (elements.follow_up_notes) elements.follow_up_notes.value = notes;
    }
    saveToStorage();
    showToast('Follow up notes saved');
}

window.updateContactCategory = function(id, cat) {
    const contact = savedContacts.find(c => c.id === id);
    if (contact) {
        contact.category = cat || null;
        saveToStorage();
        showToast('Category updated');
        // Refresh detail view
        renderTasksDetail();
    }
};

window.promptAddCategoryFromDetail = function(contactId) {
    const newCat = prompt('Enter new category name:');
    if (!newCat || !newCat.trim()) return;
    const cat = newCat.trim();
    if (!globalCategories.includes(cat)) {
        globalCategories.push(cat);
    }
    const contact = savedContacts.find(c => c.id === contactId);
    if (contact) contact.category = cat;
    saveToStorage();
    renderCategorySelector();
    renderTasksDetail();
    showToast(`Category "${cat}" created and assigned`);
};

// Event Listeners
function setupEventListeners() {
    // Global settings auto-save
    const settingsInputs = ['phone', 'name', 'owner_name', 'clinic_name', 'clinic_phone', 'email', 'clinic_google', 'clinic_address', 'notes', 'follow_up_notes'];
    settingsInputs.forEach(key => {
        elements[key]?.addEventListener('input', (e) => {
            updateGlobalSetting(key, e.target.value);
        });
    });

    // Contact search
    elements.contactSearch?.addEventListener('input', (e) => {
        renderContacts(e.target.value);
    });

    // Save contact button
    elements.saveContactBtn?.addEventListener('click', saveContact);

    // Clear form button
    elements.clearFormBtn?.addEventListener('click', clearForm);

    // Add template button
    elements.addTemplateBtn.addEventListener('click', () => openModal(true));

    // Reload templates button
    elements.reloadTemplatesBtn?.addEventListener('click', reloadDefaults);

    // Modal close handlers
    elements.closeModal.addEventListener('click', closeModal);
    elements.cancelTemplate.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // Add file button
    elements.addFileBtn?.addEventListener('click', addFileEntry);

    // Variable chips
    document.querySelectorAll('.variable-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const variable = chip.dataset.var;
            const textarea = elements.templateMessage;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;

            textarea.value = text.substring(0, start) + variable + text.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + variable.length;
            textarea.focus();
        });
    });

    // Save template
    elements.saveTemplate.addEventListener('click', () => {
        const name = elements.templateName.value.trim();
        const message = elements.templateMessage.value.trim();
        const files = getFileEntriesFromForm();

        if (!name) {
            showToast('Please enter a template name');
            elements.templateName.focus();
            return;
        }

        if (!message) {
            showToast('Please enter a message');
            elements.templateMessage.focus();
            return;
        }

        if (currentTemplateId) {
            updateTemplate(currentTemplateId, name, message, files);
            showToast('Template updated!');
        } else {
            createTemplate(name, message, files);
            showToast('Template created!');
        }

        renderTemplates();
        closeModal();
    });

    // Delete template
    elements.deleteTemplate.addEventListener('click', () => {
        if (currentTemplateId && confirm('Are you sure you want to delete this template?')) {
            deleteTemplateById(currentTemplateId);
            showToast('Template deleted');
            renderTemplates();
            closeModal();
        }
    });

    // Tasks tab: day view navigation
    document.getElementById('tasksDayBack')?.addEventListener('click', () => {
        showTasksSubView('category');
        renderTasksView();
    });

    document.getElementById('tasksDayPrev')?.addEventListener('click', () => {
        if (!tasksDayViewDate) return;
        const d = new Date(tasksDayViewDate + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        tasksDayViewDate = d.toISOString().slice(0, 10);
        renderDayView();
    });

    document.getElementById('tasksDayNext')?.addEventListener('click', () => {
        if (!tasksDayViewDate) return;
        const d = new Date(tasksDayViewDate + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        tasksDayViewDate = d.toISOString().slice(0, 10);
        renderDayView();
    });

    // Tasks tab: detail view back
    document.getElementById('tasksDetailBack')?.addEventListener('click', () => {
        if (tasksDetailBackView === 'category') {
            tasksDetailContactId = null;
            showTasksSubView('category');
            // Show only category selector — list is accessed via ☰ button
            document.getElementById('tasks-category-list-container').style.display = 'none';
            document.getElementById('tasks-calendar-container').style.display = 'none';
            renderCategorySelector(); // keep current category highlighted
        } else {
            showTasksSubView(tasksDetailBackView);
            if (tasksDetailBackView === 'day') {
                renderDayView();
            } else {
                renderCategoryContactList(tasksCurrentCat);
            }
        }
        savePosition();
    });

    // Add category button in tasks header
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
        const newCat = prompt('Enter new category name:');
        if (!newCat || !newCat.trim()) return;
        const cat = newCat.trim();
        if (!globalCategories.includes(cat)) {
            globalCategories.push(cat);
            saveToStorage();
            renderCategorySelector();
            showToast(`Category "${cat}" added`);
        } else {
            showToast('Category already exists');
        }
    });
}
