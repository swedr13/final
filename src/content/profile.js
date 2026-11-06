export const profile = {
  name: "Junelle Suaybaguio",
  shortName: "Junelle",
  roles: ["Full-Stack Developer", "Front-end Developer", "WordPress Developer"],
  location: "Davao City, Philippines",
  // Split so the address never appears as one plain string in the pre-rendered HTML.
  email: { user: "junelleXIII", domain: "gmail.com" },
  tagline: "brings designs to life.",
  intro:
    "Full-stack developer building production web apps with TypeScript and C# .NET, with years of shipping fast, polished WordPress and React sites for clients.",
  bio: [
    "I'm a full-stack developer with 4+ years in web development and IT. Today I build and maintain production web applications at Davao City Water District, using TypeScript on the front end and C# .NET on the back end.",
    "Before that I designed, launched and redesigned client websites with WordPress and marketing-automation tools, and built my first React Native app during a coding bootcamp. I care about interfaces that look great, load fast and are easy for everyone to use.",
  ],
  quote: "Rest at the end, not in the middle",
  facts: [
    { value: "4+", label: "years in web & IT" },
    { value: "13", label: "shipped projects" },
    { value: "Web · Mobile", label: "WordPress to .NET" },
  ],
  resumePdf: "Junelle-Suaybaguio-Resume.pdf",
  resumePdfSize: "PDF · 388 KB",
  siteRepo: "https://github.com/swedr13/final",
};

export const emailAddress = () => `${profile.email.user}@${profile.email.domain}`;
