var express = require('express');
var router = express.Router();
let slugify = require('slugify')
let productSchema = require('../schemas/products')
let db = require('../utils/db')

/* GET products listing. */
///api/v1/products
router.get('/', async function (req, res, next) {
  let titleQ = req.query.title ? req.query.title : '';
  let maxPrice = req.query.maxPrice ? req.query.maxPrice : 1E4;
  let minPrice = req.query.minPrice ? req.query.minPrice : 0;

  let data = db.collections.products.filter(e => !e.isDeleted);

  // Populate category
  let populated = data.map(p => {
    let copy = { ...p };
    if (copy.category) {
      let cat = db.collections.categories.find(c => c._id === copy.category);
      if (cat) {
        copy.category = { _id: cat._id, name: cat.name, images: cat.images };
      }
    }
    return copy;
  });

  let result = populated.filter(function (e) {
    return e.title.toLowerCase().includes(titleQ.toLowerCase())
      && e.price > minPrice
      && e.price < maxPrice
  })
  res.send(result);
});

router.get('/slug/:slug', async function (req, res, next) {
  let slug = req.params.slug;
  let result = db.collections.products.find(p => p.slug === slug && !p.isDeleted);
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "SLUG NOT FOUND"
    })
  }
});

///api/v1/products/:id
router.get('/:id', async function (req, res, next) {
  try {
    let result = db.collections.products.find(p => p._id === req.params.id && !p.isDeleted);
    if (result) {
      res.status(200).send(result)
    } else {
      res.status(404).send({
        message: "ID NOT FOUND"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
});

router.post('/', async function (req, res, next) {
  try {
    let newObj = productSchema.createProduct({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: '-', lower: true, locale: 'vi',
      }),
      price: req.body.price,
      description: req.body.description,
      category: req.body.categoryId,
      images: req.body.images
    })
    await newObj.save()
    res.send(newObj);
  } catch (error) {
    res.status(404).send(error.message);
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    let result = await productSchema.findByIdAndUpdate(req.params.id,
      req.body, {
      new: true
    })
    if (result) {
      res.status(200).send(result)
    } else {
      res.status(404).send({ message: "ID NOT FOUND" })
    }
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    let result = await productSchema.findByIdAndUpdate(req.params.id,
      { isDeleted: true }, {
      new: true
    })
    if (result) {
      res.status(200).send(result)
    } else {
      res.status(404).send({ message: "ID NOT FOUND" })
    }
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

module.exports = router;
