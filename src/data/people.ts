// People shown on the About page. Role, bio and alt text are translation keys.
export type PersonProfile = {
  name: string;
  roleKey: string;
  bioKey?: string;
  image?: string;
  imageAltKey?: string;
};

export const founders: PersonProfile[] = [
  {
    name: "Felipe",
    roleKey: "aboutPage.founderRole",
    bioKey: "storiesPage.summary",
    image: "/images/fotoFelipeMedina.webp",
    imageAltKey: "home.storyCards.felipe.imageAlt",
  },
];

export const teamMembers: PersonProfile[] = [
  {
    name: "Danel Egues",
    roleKey: "aboutPage.ctoRole",
    bioKey: "aboutPage.danelBio",
    image: "/images/fotoDanel.webp",
  },
  {
    name: "Jose Luis Maireles",
    roleKey: "aboutPage.cooRole",
    bioKey: "aboutPage.joseLuisBio",
    image: "/images/fotoJoseLuisMaireles.webp",
  },
  {
    name: "Alberto Morales",
    roleKey: "aboutPage.caoRole",
    bioKey: "aboutPage.albertoBio",
    image: "/images/fotoAlbertoMorales.webp",
  },
];

export const collaborators: PersonProfile[] = [];
