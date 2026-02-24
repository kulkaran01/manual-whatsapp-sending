// WhatsApp Template Messenger - Application Logic

// DOM Elements
const elements = {
    // Global settings inputs
    phone: document.getElementById('phone'),
    name: document.getElementById('name'),
    owner_name: document.getElementById('owner_name'),
    clinic_name: document.getElementById('clinic_name'),
    clinic_phone: document.getElementById('clinic_phone'),
    clinic_google: document.getElementById('clinic_google'),
    clinic_address: document.getElementById('clinic_address'),
    notes: document.getElementById('notes'),

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

// New CRM state
let globalCategories = [];
let tasksCurrentCat = '__calendar__';
let tasksCalYear = null;
let tasksCalMonth = null;
let tasksDayViewDate = null;
let tasksDetailContactId = null;
let tasksDetailBackView = 'day';
let scheduledDatePicker = null;
let currentContactScheduledDate = null;
let currentContactCategory = null;

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
    clinic_google: '',
    clinic_address: '',
    notes: ''
};

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
            savedContacts
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
    saveToStorage(); // Fire and forget - no need to await for settings updates
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
        clinic_google: contact.clinic_google || '',
        clinic_address: contact.clinic_address || '',
        notes: contact.notes || ''
    };

    currentContactScheduledDate = contact.scheduledDate || null;
    currentContactCategory = contact.category || null;
    if (scheduledDatePicker) {
        scheduledDatePicker.setDate(currentContactScheduledDate || '', false);
    }

    populateFormFromSettings();
    saveToStorage();
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
        clinic_google: '',
        clinic_address: '',
        notes: ''
    };
    populateFormFromSettings();
    if (scheduledDatePicker) {
        scheduledDatePicker.setDate('', false);
    }
    saveToStorage();
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
        '{clinic_google}': globalSettings.clinic_google,
        '{clinic_address}': globalSettings.clinic_address
    };

    Object.entries(vars).forEach(([placeholder, value]) => {
        result = result.split(placeholder).join(value || '');
    });

    return result;
}

// WhatsApp URL Generation
function generateWhatsAppUrl(message) {
    const phone = globalSettings.phone.replace(/[^0-9]/g, '');
    const filledMessage = replaceVariables(message);
    const encodedMessage = encodeURIComponent(filledMessage);
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
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
            <div class="template-chip" data-id="${template.id}">
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
                        Send
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
    if (tasksCurrentCat === '__calendar__') {
        showCalendar();
    } else {
        showCategoryList();
    }
}

function showTasksSubView(view) {
    const views = ['category', 'day', 'detail'];
    views.forEach(v => {
        const el = document.getElementById('tasks-' + v + '-view');
        if (el) el.style.display = v === view ? '' : 'none';
    });
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

    globalCategories.forEach(cat => {
        const isActive = tasksCurrentCat === cat;
        html += `<button class="category-btn ${isActive ? 'active' : ''}" onclick="selectTasksCategory('${escapeHtml(cat)}')">${escapeHtml(cat)}</button>`;
    });

    container.innerHTML = html;
}

window.selectTasksCategory = function(cat) {
    tasksCurrentCat = cat;
    renderCategorySelector();
    showTasksSubView('category');
    if (cat === '__calendar__') {
        showCalendar();
    } else {
        showCategoryList();
    }
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
    });
    document.getElementById('calNextMonth')?.addEventListener('click', () => {
        tasksCalMonth++;
        if (tasksCalMonth > 11) { tasksCalMonth = 0; tasksCalYear++; }
        renderCalendar();
    });
}

window.openDayView = function(isoDate) {
    tasksDayViewDate = isoDate;
    showTasksSubView('day');
    renderDayView();
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
        const phone = escapeHtml(contact.clinic_phone || contact.phone || '');
        const rawPhone = (contact.clinic_phone || contact.phone || '').replace(/\s/g, '');
        const backView = mode === 'day' ? 'day' : 'category';

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
    showTasksSubView('detail');
    renderTasksDetail();
};

function renderTasksDetail() {
    const contact = savedContacts.find(c => c.id === tasksDetailContactId);
    const container = document.getElementById('tasksDetailContent');
    if (!contact || !container) return;

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

    // Category options
    const currentCat = contact.category || '';
    const catOptions = ['', ...globalCategories].map(cat =>
        `<option value="${escapeHtml(cat)}" ${cat === currentCat ? 'selected' : ''}>${cat ? escapeHtml(cat) : '— None —'}</option>`
    ).join('');

    container.innerHTML = `
        <div class="detail-fields">
            <div class="detail-field"><strong>Clinic</strong><span>${escapeHtml(contact.clinic_name || '—')}</span></div>
            <div class="detail-field"><strong>Owner / Name</strong><span>${escapeHtml(contact.name || '—')}</span></div>
            <div class="detail-field"><strong>Clinic Phone</strong><span>${escapeHtml(contact.clinic_phone || '—')}</span></div>
            <div class="detail-field"><strong>WhatsApp</strong><span>${escapeHtml(contact.phone || '—')}</span></div>
            <div class="detail-field"><strong>Address</strong><span>${escapeHtml(contact.clinic_address || '—')}</span></div>
            <div class="detail-field"><strong>Scheduled Date</strong><span>${escapeHtml(contact.scheduledDate || '—')}</span></div>
            ${contact.notes ? `<div class="detail-field"><strong>Notes</strong><span>${escapeHtml(contact.notes)}</span></div>` : ''}
        </div>

        <div class="detail-section">
            <h4>Category</h4>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <select class="detail-cat-select" onchange="updateContactCategory('${contact.id}', this.value)">
                    ${catOptions}
                </select>
                <button class="btn-add-category" onclick="promptAddCategoryFromDetail('${contact.id}')">+ New Category</button>
            </div>
        </div>

        <div class="detail-section">
            <h4>Message History</h4>
            ${logsHtml}
        </div>
    `;
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
    const settingsInputs = ['phone', 'name', 'owner_name', 'clinic_name', 'clinic_phone', 'clinic_google', 'clinic_address', 'notes'];
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
        showTasksSubView(tasksDetailBackView);
        if (tasksDetailBackView === 'day') {
            renderDayView();
        } else {
            renderCategoryContactList(tasksCurrentCat);
        }
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
