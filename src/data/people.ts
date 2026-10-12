// People shown on the About page. Role, bio and alt text are translation keys.
export type PersonProfile = {
  name: string;
  roleKey: string;
  bioKey: string;
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

export const teamMembers: PersonProfile[] = [];

export const collaborators: PersonProfile[] = [];
