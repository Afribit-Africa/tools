export const siteConfig = {
  name: 'Afribitools',
  description: 'All-in-one solution for Bitcoin circular economy organizations',
  url: 'https://tools.afribit.africa',
  ogImage: 'https://tools.afribit.africa/og.png',
  links: {
    github: 'https://github.com/Afribit-Africa/tools',
    twitter: 'https://twitter.com/afribitafrica',
  },
  creator: 'Afribit Africa',
}

export const modules = [
  {
    id: 'fastlight',
    name: 'Fastlight',
    description: 'Bulk verify and clean Blink lightning addresses',
    icon: '⚡',
    href: '/fastlight',
    status: 'active',
    tags: ['CSV', 'XLSX', 'Validation', 'Lightning'],
    features: [
      'Upload CSV or XLSX files',
      'Automatic whitespace trimming',
      'Real-time validation',
      'Export cleaned results',
    ],
  },
  // Future modules can be added here
] as const

export type ModuleId = typeof modules[number]['id']
