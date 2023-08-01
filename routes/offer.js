const express = require("express");
const Offer = require("../models/Offer");
const router = express.Router();
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertedB64");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileupload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body
      const newOffer = new Offer({
        product_name: title,

        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand
          },
          {
            TAILLE: size
          },
          {
            ÉTAT: condition
          },
          {
            COULEUR: color
          },
          {
            EMPLACEMENT: city
          }
        ],
        owner: req.user
      })

      if (req.files) {
        const pictureToUpload = convertToBase64(req.files.picture)
        const uploadrResult = await cloudinary.uploader.upload(pictureToUpload)
        newOffer.product_image = uploadrResult
      }
      await newOffer.save()
      res.json(newOffer)
    } catch (error) {
      res.json(error.message);
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const limit = 5;
    let currentPage = 1;
    const { title, priceMax, priceMin, sort, page } = req.query;
    const filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMax) {
      filters.product_price = { $lte: priceMax };
    }
    if (priceMin) {
      if (priceMax) {
        filters.product_price.$gte = priceMin;
      } else {
        filters.product_price = { $gte: priceMin };
      }
    }
    console.log("filters", filters);
    const sortObject = {};
    if (sort === "price-desc") {
      sortObject.product_price = "desc";
    } else if (sort === "price-asc") {
      sortObject.product_price = "asc";
    }
    //Pagination
    currentPage = page;
    const offers = await Offer.find(filters)
      .sort(sortObject)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate({ path: "owner", select: "account -_id" })
      .select("-_v");
    const count = await Offer.countDocuments(filters);
    console.log("count=>", count);
    return res.status(200).json({ count: count, offers: offers });
    // const offer = await Offer.find(filters);
    // console.log(offer);

    // if (sort === "price-desc") {
    //  sortObject.sort({ product_price: "desc" });
    // } else if (req.query.sort === "price-asc") {
    //   offer = offer.sort({ product_price: "asc" });
    // }

    // if (!req.query.page) {
    //   // offer = offer.limit(10);
    // } else {
    //   offer = offer.limit(10).skip(10 * (req.query.page - 1));
    // }
    // return res.json(offer);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const result = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });
    if (result) {
      return res.status(200).json({ result });
    } else {
      return res.status(400).json("Cette offre n'existe pas (ou plus) !");
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
