const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;
app.set("view engine", "ejs");
app.use(express.static("public"));


app.use(express.urlencoded({ extended: true }));

const apiheader = {
  "User-Agent": "commander-gen",
  "Accept": "application/json",

};

// scryfall api has letters for each color, corresponding to wubrg and c for colorless
const allowedc = ["w", "u", "b", "r", "g", "c"];

// route to show the form
app.get("/", (req, res) => {

  res.render("index", { error: null });
});

// route 2 for the form and call the api
app.post("/card", async (req, res) => {
  let colors = [].concat(req.body.colors || []);


  if (colors.length === 0) {
    return res.render("index", { error: "Pick at least one color" });
  }

  // colorless is a bit weird in the game of magic as it usually only corresponds to eldrazi creatures. 
  // colorless should take priority over colors to find eldrazi creatures for that purpose
  // on top of this, due to the devoid mechanic cards can be colorless but have a color identity, so to get around weird
  // errors just have it choose colorless by default otherwise it would break
  if (colors.includes("c")) {
    colors = ["c"];
  }

  // use scryfall api
  //   t:legendary t:creature  is for legendary creatures, since only they can be commanders
  //   id=${colors.join("")}  search for colors selected
  //   legal:commander is to search for if it is playable in the commander so it doesn't choose banned cards like golos
  const query = `t:legendary t:creature id=${colors.join("")} legal:commander`;

  try {
    const response = await axios.get("https://api.scryfall.com/cards/random", {
      params: { q: query },
      headers: apiheader,
    });


   //ran into errors where two sided cards would crash the application. if there is a two sided card, by default display the front side
   //so that it wont crash randomly
   const card = response.data;

  let imageUrl;
    if (card.image_uris) {
      imageUrl = card.image_uris.normal;

}    else {
      imageUrl = card.card_faces[0].image_uris.normal;
}

res.render("result", { card, imageUrl, colors });



} catch (error) {
  const message = "There was an error. Please try again.";

  res.render("index", { error: message });
}
  }
);

app.listen(PORT, () => {
  console.log(`The server is running at http://localhost:${PORT}`);
});