// Update the farcaster.json file with our Stack game information
export const GET = async () => {
  return new Response(
    JSON.stringify({
      // Required fields
      version: 1,
      frame: {
        image: `${process.env.NEXT_PUBLIC_URL}/images/stack-game-embed.png`,
        buttons: [
          {
            label: "Play Stack Game",
            action: "post",
          },
        ],
        post_url: `${process.env.NEXT_PUBLIC_URL}/api/frame`,
      },
      // Optional fields
      image: {
        aspect_ratio: "1.91:1",
      },
      // App metadata
      appTitle: "Stack Game",
      appDescription: "Stack blocks as high as you can in this addictive mini-game!",
      buttons: [
        {
          label: "Play Now",
          action: "link",
          target: `${process.env.NEXT_PUBLIC_URL}`,
        },
      ],
      // Customization
      customization: {
        primaryColor: "#7C4DFF",
        secondaryColor: "#448AFF",
      },
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    }
  );
};
