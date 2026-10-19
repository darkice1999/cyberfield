// War Room contains 200 defender missions in each of eight areas (1,600 total).
// Scenarios are constructed from reviewed defensive playbooks so every answer is
// actionable and no mission asks the learner to practise offensive techniques.
const categories = [
  { id: 'phishing', icon: 'mark_email_unread', label: 'Phishing & BEC', color: '#ff4444', desc: 'Messages, payment diversion and mailbox compromise',
    events: ['lookalike payroll reset email', 'supplier bank-detail change', 'fake document-share alert', 'executive gift-card request', 'cloud-storage quota warning', 'invoice thread reply from a compromised mailbox', 'QR-code sign-in lure', 'fake tax refund message', 'calendar invite with a credential link', 'shared-file comment with a password demand', 'benefits enrollment impersonation', 'delivery-fee smishing campaign', 'vendor account reactivation request', 'urgent wire-transfer request', 'password-reset link forwarding request', 'unknown OAuth consent prompt', 'charity donation receipt with a new link', 'recruiter requesting identity documents', 'fake customer-support callback', 'meeting recording download lure', 'mailbox-forwarding request', 'fake browser update attachment', 'encrypted invoice with a login lure', 'travel reimbursement diversion', 'finance-system login warning'],
    clue: 'The requested action arrives through an unverified message and does not match the organization’s normal process.',
    contain: 'Quarantine the message and block the known indicator where your team has authority', verify: 'Verify the request through a pre-existing contact or trusted portal', escalate: 'Record the event and escalate through the security and finance response process', prevent: 'Notify likely recipients and review affected mailbox or payment controls', wrong: 'Reply to the sender and use the link in the message to verify it' },
  { id: 'ransomware', icon: 'security', label: 'Ransomware Response', color: '#cc44ff', desc: 'Containment, recovery and operational continuity',
    events: ['unexpected file-encryption alert', 'ransom note on a finance workstation', 'unusual backup deletion event', 'mass file rename in a shared drive', 'endpoint tool reporting suspicious encryption', 'remote-management account used overnight', 'critical server suddenly unavailable', 'hypervisor snapshot deletion warning', 'encrypted medical scheduling share', 'database export followed by encryption', 'malicious macro execution alert', 'privileged account used from a new location', 'warehouse label system outage', 'ransom note in a cloud file share', 'EDR alert for credential dumping', 'offline backup vault access attempt', 'unusual remote desktop activity', 'widespread endpoint restart loop', 'manufacturing share becoming unavailable', 'security tool tamper alert', 'file server CPU spike and extension changes', 'new scheduled task on a domain controller', 'email attachment outbreak report', 'backup restore test failure', 'data-exfiltration alert before encryption'],
    clue: 'The signals suggest active disruption; containment and evidence preservation must happen before recovery.',
    contain: 'Isolate the affected hosts using the approved response procedure', verify: 'Confirm scope from endpoint, identity and network telemetry', escalate: 'Activate the incident plan and notify the responsible incident lead', prevent: 'Protect clean backups and restrict further lateral movement', wrong: 'Pay the ransom or run unverified decryption tools before containing the spread' },
  { id: 'identity', icon: 'key', label: 'Identity & Access', color: '#44aaff', desc: 'MFA, account recovery, sessions and permissions',
    events: ['unexpected MFA approval storm', 'unrequested device-code login', 'unknown passkey enrollment', 'privileged role assignment alert', 'new email forwarding rule', 'impossible-travel sign-in event', 'service account key created unexpectedly', 'recovery code request from a caller', 'session-cookie sharing request', 'shared mailbox access request', 'password reset from an unrecognized device', 'new OAuth app with mail-read permission', 'administrator account created after hours', 'inactive contractor account reactivated', 'identity provider tenant mismatch', 'MFA method removed from an executive account', 'authentication policy change notification', 'API token used from a new region', 'new delegated mailbox permission', 'privileged password vault checkout', 'suspicious SSO application invite', 'recovery email address changed', 'bulk user password reset request', 'security-key replacement request', 'legacy authentication sign-in alert'],
    clue: 'Authentication and authorization changes need confirmation through the identity system, not through a caller or message.',
    contain: 'Revoke or suspend the suspicious session, token or grant using approved identity controls', verify: 'Check the identity audit trail and confirm the change with the account owner through a trusted channel', escalate: 'Escalate to identity security and preserve the relevant audit evidence', prevent: 'Review recovery methods, connected apps and least-privilege assignments', wrong: 'Approve the request because the caller knows the employee name or department' },
  { id: 'cloud', icon: 'cloud', label: 'Cloud Security', color: '#00ccff', desc: 'Storage, tenants, keys and third-party apps',
    events: ['public storage container alert', 'cloud access key found in source control', 'new external tenant invitation', 'object storage download spike', 'serverless function with broad permissions', 'unexpected security-group change', 'backup vault shared externally', 'new cloud administrator role', 'storage bucket policy becoming public', 'suspicious CI/CD deployment token', 'database snapshot shared with another account', 'unrecognized SaaS integration', 'new access key for a dormant user', 'cloud audit log disabled', 'machine image shared publicly', 'container registry pull from an unknown identity', 'new federation trust configuration', 'virtual machine metadata access alert', 'high-risk OAuth app in cloud mail', 'unexpected public IP on a database', 'cross-account role assumption', 'secret manager value accessed overnight', 'data-loss-prevention alert in cloud drive', 'orphaned project with production data', 'unexpected infrastructure-as-code change'],
    clue: 'Cloud events need scope, owner and effective-permission checks before anyone changes or deletes evidence.',
    contain: 'Restrict public or excessive access using the approved cloud control plane', verify: 'Review audit logs, effective permissions and the resource owner’s change record', escalate: 'Open an incident with the cloud security owner and preserve configuration evidence', prevent: 'Rotate exposed credentials and check comparable resources for the same condition', wrong: 'Delete the resource immediately before preserving logs or understanding its dependencies' },
  { id: 'web', icon: 'code', label: 'Application Defence', color: '#00cc88', desc: 'Web apps, APIs and secure software delivery',
    events: ['spike in failed login requests', 'unusual API enumeration pattern', 'input-validation alert on a public form', 'suspicious file upload', 'unexpected administrator API call', 'web application firewall anomaly', 'dependency vulnerability advisory', 'release pipeline signing failure', 'new client-side script on checkout', 'session fixation indicator', 'authorization error in a customer portal', 'rate-limit exhaustion attempt', 'unexpected database query volume', 'security header regression in a release', 'code-scanning alert in a pull request', 'new package with a typo-similar name', 'API key exposed in browser telemetry', 'unusual password-reset volume', 'customer-report of data access mismatch', 'production debug endpoint detected', 'CI runner downloading an unknown tool', 'suspicious webhook destination', 'integrity check failure on static content', 'cross-origin policy change', 'public source-map containing configuration data'],
    clue: 'The event may affect customers; verify evidence, reduce exposure and involve the owning engineering team.',
    contain: 'Apply a narrowly scoped protective control such as rate limiting or temporary route restriction', verify: 'Review server, application and deployment telemetry with the service owner', escalate: 'Open the incident with application security and preserve relevant logs and release evidence', prevent: 'Fix the root cause through code, configuration and least-privilege review', wrong: 'Destroy logs or change production data to make the alert disappear' },
  { id: 'human', icon: 'badge', label: 'Human & Physical', color: '#ffcc00', desc: 'Help desk, visitors, devices and social engineering',
    events: ['urgent help-desk password-reset call', 'unknown visitor requesting access', 'USB drive found near the office', 'employee photographed badge at reception', 'courier asking for server-room entry', 'caller impersonating a senior executive', 'lost laptop report', 'unattended unlocked workstation', 'tailgating attempt at a secure door', 'printed payroll list left near a printer', 'employee receiving a suspicious QR poster', 'cleaning contractor requesting Wi-Fi credentials', 'new starter asking for shared admin access', 'conference attendee requesting a confidential file', 'manager asking to bypass onboarding checks', 'vendor requesting a remote-support session', 'employee report of a threatening SMS', 'stranger claiming to collect retired equipment', 'visitor using someone else’s badge', 'social-media post exposing a travel schedule', 'personal cloud upload from a shared device', 'suspicious phone charger found in a meeting room', 'lost access card reported after hours', 'employee asked to share an OTP', 'external interviewer requesting candidate files'],
    clue: 'Social pressure is not identity proof. Use the known verification procedure and protect people from blame for escalating.',
    contain: 'Pause the requested access or transfer and keep the person or item away from sensitive systems', verify: 'Use the registered contact, visitor system or documented process to verify the claim', escalate: 'Notify the appropriate security, facilities or help-desk lead and record the event', prevent: 'Share a concise warning with affected staff and reinforce the normal verification step', wrong: 'Make an exception because the request sounds urgent or comes from a senior-sounding person' },
  { id: 'mobile', icon: 'smartphone', label: 'Mobile & Payment', color: '#ff6699', desc: 'Smishing, SIM swaps, wallets and payment safety',
    events: ['suspected SIM-swap request', 'bank-transfer OTP relay attempt', 'mobile wallet payment reversal scam', 'delivery-fee smishing campaign', 'new device on a banking account', 'mobile-money account recovery request', 'QR-code payment sticker replacement', 'fraudulent airtime request from a saved contact', 'unusual card-not-present transaction alert', 'payment-app push approval', 'phone number port-out request', 'merchant refund overpayment message', 'banking app sideload warning', 'lost phone with active work apps', 'eSIM activation request', 'cryptocurrency giveaway message', 'public Wi-Fi certificate prompt', 'mobile device management removal', 'suspicious contactless payment activity', 'new payee added to a wallet', 'SMS sender-ID impersonation', 'call-forwarding code request', 'mobile backup shared with an unknown account', 'payment terminal software update prompt', 'account freeze threat by text'],
    clue: 'Mobile messages and codes can authorize real money movement. Confirm the action in the genuine app before approving anything.',
    contain: 'Pause the transaction, port or account change through the official provider process', verify: 'Check the genuine banking, telecom or wallet app and confirm through an existing support contact', escalate: 'Notify the relevant fraud or security team with the message and transaction reference', prevent: 'Secure the account, review authentication methods and warn potentially affected users', wrong: 'Read an OTP, approve a push or pay a fee solely because a message says it will reverse a problem' },
  { id: 'insider', icon: 'database', label: 'Data & Insider Risk', color: '#ffb454', desc: 'Data handling, departing staff and unusual access',
    events: ['large personal-cloud upload', 'departing employee downloading customer records', 'unusual print volume from finance', 'mass export from a CRM', 'confidential file shared outside the organization', 'sensitive attachment sent to a personal address', 'database backup copied to removable media', 'access to data outside an employee’s role', 'source-code archive sent through an unapproved service', 'new bulk-download permission', 'legal-hold data deletion alert', 'HR document access from a new location', 'research dataset copied to a personal workspace', 'customer file included in a support ticket', 'record-retention policy bypass', 'suspicious screenshot activity in a secure app', 'export performed by a dormant account', 'unusual access before a resignation date', 'vendor given unrestricted shared-drive access', 'sensitive spreadsheet copied into a public chat', 'secret uploaded to a project wiki', 'mass download from a document repository', 'personal email forwarding rule on a privileged account', 'contract archive accessed by an unrelated team', 'unapproved AI tool receiving confidential text'],
    clue: 'Not every large transfer is malicious, but the owner, data classification and approved destination must be checked before conclusions or confrontation.',
    contain: 'Limit the risky transfer or access using the approved data-protection control', verify: 'Preserve logs and confirm business purpose, data owner and destination through the established process', escalate: 'Coordinate with security, data owner, HR or legal according to the incident plan', prevent: 'Review scope, revoke unnecessary access and improve the relevant data-handling control', wrong: 'Confront the person publicly or delete potential evidence before the investigation is coordinated' },
];

const levelInfo = [
  { label: 'Guided', badge: 'GUIDED', time: 75, min: 2, note: 'Start with the immediate safe response. The evidence is clear and the best actions are practical.' },
  { label: 'Investigative', badge: 'INVESTIGATIVE', time: 60, min: 3, note: 'Compare evidence, preserve the right facts and choose actions in the correct order.' },
  { label: 'Strategic', badge: 'STRATEGIC', time: 45, min: 4, note: 'Work through conflicting signals, scope, dependencies and lasting controls. Do not guess.' },
  { label: 'Strategic', badge: 'STRATEGIC', time: 45, min: 4, note: 'Work through conflicting signals, scope, dependencies and lasting controls. Do not guess.' },
];

function levelFor(index) {
  // 40 guided, 80 investigative and 80 strategic per category.
  return index < 40 ? 0 : index < 120 ? 1 : 2;
}

function actionsFor(category, index, level) {
  const id = `${category.id}-${index + 1}`;
  const correct = [
    { id: `${id}-a`, text: category.contain, correct: true, points: 25, feedback: `✓ Containment reduces immediate exposure while the team investigates.` },
    { id: `${id}-b`, text: category.verify, correct: true, points: 25, feedback: `✓ Independent verification prevents decisions based on an attacker-controlled story.` },
    { id: `${id}-c`, text: category.escalate, correct: true, points: 25, feedback: `✓ Escalation and evidence preservation support a coordinated response.` },
    { id: `${id}-d`, text: category.prevent, correct: true, points: 25, feedback: `✓ The lasting control reduces recurrence after the immediate response.` },
  ];
  const wrong = [
    { id: `${id}-x`, text: category.wrong, correct: false, points: 0, feedback: `✕ This bypasses independent verification and can increase harm.` },
    { id: `${id}-y`, text: 'Wait for more complaints before recording or escalating the event', correct: false, points: 0, feedback: `✕ Delay can increase impact and make evidence harder to preserve.` },
  ];
  return level === 0 ? [correct[0], correct[1], wrong[0], wrong[1]] : [...correct, ...wrong];
}

function makeScenario(category, index) {
  const level = levelFor(index);
  const info = levelInfo[level];
  const event = category.events[index % category.events.length];
  const cycle = Math.floor(index / category.events.length) + 1;
  const title = `Mission ${String(index + 1).padStart(3, '0')} · ${info.label}: ${event.replace(/^./, c => c.toUpperCase())}`;
  const story = level === 0
    ? `A team member reports a ${event}. The first evidence points to a risk, but no damage is confirmed. Choose the safe first steps for response cycle ${cycle}.`
    : level === 1
      ? `Monitoring shows a ${event}. The owner has not confirmed the change and related signals may be incomplete. Build a careful response using evidence, containment and the right escalation path. Response cycle ${cycle}.`
      : `Multiple signals connect to a ${event}: the change may be legitimate, malicious or part of a wider incident. Balance operational impact with evidence preservation, scope and durable remediation. Response cycle ${cycle}.`;
  return {
    id: `${category.id}-${String(index + 1).padStart(3, '0')}`,
    title, difficulty: info.label, isAttacker: false, timeLimit: info.time,
    badge: info.badge, badgeColor: category.color, story,
    threat: { from: 'SECURITY OPERATIONS', subject: `${info.label.toUpperCase()} ALERT: ${event}`, body: `Signal: ${event}\nAssessment: ${category.clue}\nMission note: ${info.note}\n\nThis is a fictional defensive training alert.` },
    actions: actionsFor(category, index, level), minCorrect: info.min, wrongAllowed: 0,
  };
}

export const WAR_ROOM_CATEGORIES = categories.map(category => ({
  ...category,
  scenarios: Array.from({ length: 200 }, (_, index) => makeScenario(category, index)),
}));

export const WAR_ROOM_TOTAL = WAR_ROOM_CATEGORIES.reduce((total, category) => total + category.scenarios.length, 0);
