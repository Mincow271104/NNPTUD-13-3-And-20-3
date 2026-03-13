var express = require('express');
var router = express.Router();
let slugify = require('slugify')
let categorySchema = require('../schemas/categories')
let db = require('../utils/db')

/* GET categories listing. */
///api/v1/categories
router.get('/', async function (req, res, next) {
  let data = db.collections.categories.filter(e => !e.isDeleted);
  res.send(data);
});

router.get('/slug/:slug', async function (req, res, next) {
  let slug = req.params.slug;
  let result = db.collections.categories.find(c => c.slug === slug && !c.isDeleted);
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "SLUG NOT FOUND"
    })
  }
});

///api/v1/categories/:id
router.get('/:id', async function (req, res, next) {
  try {
    let result = db.collections.categories.find(c => c._id === req.params.id && !c.isDeleted);
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
    let newObj = categorySchema.createCategory({
      name: req.body.name,
      slug: slugify(req.body.name, {
        replacement: '-', lower: true, locale: 'vi',
      }),
      description: req.body.description,
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
    let result = await categorySchema.findByIdAndUpdate(req.params.id,
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
    let result = await categorySchema.findByIdAndUpdate(req.params.id,
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
