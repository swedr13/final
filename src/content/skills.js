import {
  SiTypescript, SiJavascript, SiReact, SiNextdotjs, SiHtml5, SiDotnet, SiPhp,
  SiNodedotjs, SiMysql, SiWordpress, SiZapier, SiPostman, SiGithub,
} from "react-icons/si";
import { TbBrandCSharp, TbBrandCss3, TbBrandVscode, TbRocket } from "react-icons/tb";
import { FaSlack, FaWindows } from "react-icons/fa";

export const skillGroups = [
  {
    title: "Front end",
    items: [
      { name: "TypeScript", Icon: SiTypescript },
      { name: "JavaScript", Icon: SiJavascript },
      { name: "React", Icon: SiReact },
      { name: "Next.js", Icon: SiNextdotjs },
      { name: "React Native", Icon: SiReact },
      { name: "HTML5", Icon: SiHtml5 },
      { name: "CSS3", Icon: TbBrandCss3 },
    ],
  },
  {
    title: "Back end & data",
    items: [
      { name: "C#", Icon: TbBrandCSharp },
      { name: ".NET", Icon: SiDotnet },
      { name: "PHP", Icon: SiPhp },
      { name: "Node.js", Icon: SiNodedotjs },
      { name: "MySQL", Icon: SiMysql },
    ],
  },
  {
    title: "CMS & automation",
    items: [
      { name: "WordPress", Icon: SiWordpress },
      { name: "ClickFunnels", Icon: TbRocket },
      { name: "GoHighLevel", Icon: TbRocket },
      { name: "Zapier", Icon: SiZapier },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "VS Code", Icon: TbBrandVscode },
      { name: "GitHub", Icon: SiGithub },
      { name: "Postman", Icon: SiPostman },
      { name: "Slack", Icon: FaSlack },
      { name: "Windows", Icon: FaWindows },
    ],
  },
];
