// The "Curiosity feeds adaptability" headset wall, ported from the Framer home page.
// Geometry is Framer's: card centres as % of a 1109 × 1006 stage, photo size in stage px, and each
// card's own 3D angle (degrees) and depth (px), all in one shared 3D space (perspective 500, as Framer's
// 3D Look renders it). The whole wall then turns with the pointer.
export type HeadsetCard = {
  src: string;
  caption: string;
  alt: string;
  x: number; // centre, % of stage width
  y: number; // centre, % of stage height
  w: number; // photo width, stage px
  h: number; // photo height, stage px
  rx?: number;
  ry?: number;
  rz?: number;
  tz?: number;
  radius?: number;
};

export const STAGE = { width: 1109, height: 1006, perspective: 500 };

export const headsetWall = {
  heading: "Curiosity feeds adaptability.",
  body: "I’ve lost count of the platforms I’ve designed for, and I’m not tired of it yet.",
  cards: [
    { src: "/me/headsets/vision-pro.jpg", caption: "Apple Vision Pro", alt: "Apoorv wearing an Apple Vision Pro", x: 14.88, y: 21.77, w: 240, h: 320, rx: -20, ry: 30, rz: 19 },
    { src: "/me/headsets/even-g1.jpg", caption: "Even Realities G1", alt: "Apoorv wearing Even Realities G1 smart glasses", x: 45.81, y: 17.3, w: 133, h: 178, rx: -30, ry: 20, rz: 11, tz: 34 },
    { src: "/me/headsets/hololens-2.jpg", caption: "Microsoft HoloLens 2", alt: "Apoorv wearing a Microsoft HoloLens 2", x: 72.14, y: 21.77, w: 239, h: 318, rx: -20, ry: -30, rz: -19 },
    { src: "/me/headsets/quest-3.jpg", caption: "Meta Quest 3", alt: "Apoorv holding Meta Quest 3 controllers at an outdoor demo", x: 6.31, y: 57.95, w: 130, h: 281, ry: 70 },
    { src: "/me/headsets/realwear.jpg", caption: "RealWear", alt: "Apoorv wearing a RealWear headset", x: 93.6, y: 48.81, w: 140, h: 305, ry: -70 },
    { src: "/me/headsets/spectacles.jpg", caption: "Snap Spectacles", alt: "Apoorv wearing Snap Spectacles", x: 30.93, y: 78.23, w: 249, h: 319, rx: 20, ry: 30, rz: -19 },
    { src: "/me/headsets/hololens-2-lab.jpg", caption: "Microsoft HoloLens 2", alt: "Apoorv wearing a HoloLens 2 in a blue-lit lab", x: 60.5, y: 83.5, w: 142, h: 310, rx: 20, ry: -40, rz: 19 },
    { src: "/me/headsets/tilt-five.jpg", caption: "Tilt Five AR", alt: "Apoorv wearing Tilt Five AR glasses", x: 86.02, y: 80.82, w: 189, h: 189, rx: 30, ry: -20, rz: 11, tz: -129, radius: 16 },
  ] satisfies HeadsetCard[],
};

// Spatial-interface screenshots that trail the cursor across the home hero.
export const heroTrail = ["01", "02", "03", "04", "05", "06"].map((n) => `/me/trail/${n}.jpg`);
