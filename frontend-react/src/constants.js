/**
 * constants.js — Domain data mirroring model_service.py constants
 *
 * CLASS_LABELS = ["BENIGN", "Web Attack - Brute Force",
 *                 "Web Attack - SQL Injection", "Web Attack - XSS"]
 * ACTIONS      = {0: "Allow Connection", 1: "Block Source IP", 2: "Isolate Host"}
 * _PORT_HEURISTICS (synthetic mode)
 */

export const CLASS_LABELS = [
  'BENIGN',
  'Web Attack - Brute Force',
  'Web Attack - SQL Injection',
  'Web Attack - XSS',
];

export const DEFENSE_ACTIONS = [
  'Allow Connection',
  'Block Source IP',
  'Isolate Host',
];

/** Quick-select ports shown in the input card */
export const QUICK_PORTS = [53, 80, 443, 22, 8080, 3306];

/**
 * Known ports with expected model behaviour (from _PORT_HEURISTICS in model_service.py)
 * Used to build the "Known Ports" reference tab.
 */
export const KNOWN_PORTS = [
  // BENIGN
  { port: 53,   name: 'DNS',       protocol: 'UDP', threatClass: 'BENIGN',                        safe: true },
  { port: 389,  name: 'LDAP',      protocol: 'TCP', threatClass: 'BENIGN',                        safe: true },
  { port: 443,  name: 'HTTPS',     protocol: 'TCP', threatClass: 'BENIGN',                        safe: true },
  { port: 636,  name: 'LDAPS',     protocol: 'TCP', threatClass: 'BENIGN',                        safe: true },
  { port: 993,  name: 'IMAPS',     protocol: 'TCP', threatClass: 'BENIGN',                        safe: true },
  { port: 995,  name: 'POP3S',     protocol: 'TCP', threatClass: 'BENIGN',                        safe: true },
  { port: 3389, name: 'RDP',       protocol: 'TCP', threatClass: 'BENIGN',                        safe: true },
  { port: 8443, name: 'Alt-HTTPS', protocol: 'TCP', threatClass: 'BENIGN',                        safe: true  },
  // Brute Force
  { port: 80,   name: 'HTTP',      protocol: 'TCP', threatClass: 'Web Attack - Brute Force',      safe: false },
  { port: 22,   name: 'SSH',       protocol: 'TCP', threatClass: 'Web Attack - Brute Force',      safe: false },
  { port: 21,   name: 'FTP',       protocol: 'TCP', threatClass: 'Web Attack - Brute Force',      safe: false },
  { port: 23,   name: 'Telnet',    protocol: 'TCP', threatClass: 'Web Attack - Brute Force',      safe: false },
  { port: 25,   name: 'SMTP',      protocol: 'TCP', threatClass: 'Web Attack - Brute Force',      safe: false },
  { port: 110,  name: 'POP3',      protocol: 'TCP', threatClass: 'Web Attack - Brute Force',      safe: false },
  // SQL Injection
  { port: 8080, name: 'Alt-HTTP',  protocol: 'TCP', threatClass: 'Web Attack - SQL Injection',    safe: false },
  { port: 3306, name: 'MySQL',     protocol: 'TCP', threatClass: 'Web Attack - SQL Injection',    safe: false },
  { port: 5432, name: 'PostgreSQL',protocol: 'TCP', threatClass: 'Web Attack - SQL Injection',    safe: false },
  { port: 1433, name: 'MSSQL',     protocol: 'TCP', threatClass: 'Web Attack - SQL Injection',    safe: false },
  { port: 1521, name: 'Oracle DB', protocol: 'TCP', threatClass: 'Web Attack - SQL Injection',    safe: false },
  // XSS
  { port: 8000, name: 'Dev HTTP',  protocol: 'TCP', threatClass: 'Web Attack - XSS',              safe: false },
  { port: 8888, name: 'Jupyter',   protocol: 'TCP', threatClass: 'Web Attack - XSS',              safe: false },
  { port: 4000, name: 'Custom',    protocol: 'TCP', threatClass: 'Web Attack - XSS',              safe: false },
  { port: 9000, name: 'Custom',    protocol: 'TCP', threatClass: 'Web Attack - XSS',              safe: false },
  { port: 9090, name: 'Prometheus',protocol: 'TCP', threatClass: 'Web Attack - XSS',              safe: false },
  { port: 445,  name: 'SMB',       protocol: 'TCP', threatClass: 'Web Attack - XSS',              safe: false },
];

/** Short label for a threat type */
export function shortThreatLabel(threatType) {
  if (!threatType || threatType === 'BENIGN') return 'Benign';
  if (threatType.includes('Brute Force')) return 'Brute Force';
  if (threatType.includes('SQL')) return 'SQL Injection';
  if (threatType.includes('XSS')) return 'XSS';
  return threatType;
}

/** CSS class suffix for a result */
export function statusClass(result) {
  if (!result) return '';
  if (result.status === 'UNKNOWN') return 'unknown';
  return result.is_safe ? 'safe' : 'threat';
}

/** Emoji for status */
export function statusEmoji(result) {
  if (!result) return '';
  if (result.status === 'UNKNOWN') return '❓';
  return result.is_safe ? '✅' : '🚨';
}

/** Verdict label */
export function verdictLabel(result) {
  if (!result) return '';
  if (result.status === 'UNKNOWN') return 'UNKNOWN PORT';
  return result.is_safe ? 'SAFE' : 'THREAT DETECTED';
}
