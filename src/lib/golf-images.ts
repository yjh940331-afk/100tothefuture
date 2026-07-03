const unsplash = (id: string, width = 1400, quality = 75) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;

// Keep these assignments visually distinct. When adding new photos, prefer a
// new key instead of reusing one that already appears on another public section.
export const GOLF_IMAGES = {
  hero: {
    home: unsplash("photo-1749707542832-ca6b4e1b113d", 2200),
    request: unsplash("photo-1623113807896-3b3a7fc2aec0", 1800),
    cta: unsplash("photo-1752079310560-dba000baea2a", 1800),
  },
  pros: {
    kim: {
      profile: unsplash("photo-1535131749006-b7f58c99034b", 1200, 70),
      gallery: [
        unsplash("photo-1587174486073-ae5e5cff23aa", 1200, 70),
        unsplash("photo-1592919505780-303950717480", 1200, 70),
        unsplash("photo-1500932334442-8761ee4810a7", 1200, 70),
      ],
    },
    park: {
      profile: unsplash("photo-1611374243147-44a702c2d44c", 1200, 70),
      gallery: [
        unsplash("photo-1593282153762-a41e3cceb06c", 1200, 70),
        unsplash("photo-1698692351407-152c591c0ecd", 1200, 70),
      ],
    },
    leeJoon: {
      profile: unsplash("photo-1645143617907-1378a279eef2", 1200, 70),
      gallery: [
        unsplash("photo-1562204320-31975a5e09ce", 1200, 70),
        unsplash("photo-1538648759472-7251f7cb2c2f", 1200, 70),
      ],
    },
    jung: {
      profile: unsplash("photo-1597369237991-5c95d1b6e0c8", 1200, 70),
      gallery: [
        unsplash("photo-1591491698714-9631092f6c4f", 1200, 70),
        unsplash("photo-1592937238247-cd0090e02f65", 1200, 70),
      ],
    },
  },
  info: {
    wear: "/ads/golf-wear-campaign.jpg",
    equipment: unsplash("photo-1562204320-8f3cbd731632"),
    story: unsplash("photo-1633597468433-fdb200b73f62"),
    wiki: unsplash("photo-1605144884374-ecbb643615f6"),
  },
  sponsor: {
    gearFitting: unsplash("photo-1591491640784-3232eb748d4b"),
    fieldPackage: unsplash("photo-1532508583690-538a1436f423"),
    wearCampaign: "/ads/golf-wear-campaign.jpg",
  },
} as const;
