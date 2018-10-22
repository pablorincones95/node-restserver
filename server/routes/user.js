const express = require('express');
const bcrypt = require('bcryptjs');
const _ = require('underscore');
const User = require('../models/user');
const app = express();


app.get('/usuarios', (req, res) => {
  let since = req.query.since || 0;
  since = Number(since);

  let limit = req.query.limit || 5;
  limit = Number(limit);

  User.find({ status: true }, 'name email img role google').skip(since).limit(limit).exec((err, users) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    };

    User.count({ status: true }, (err, count) => {
      res.json({
        ok: true,
        users,
        count
      })
    });
  });
});

app.post('/usuario', (req, res) => {
  let body = req.body

  let user = new User({
    name: body.email,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  });

  user.save((err, userDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      user: userDB
    })
  });

});

app.put('/usuario/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'status']);

  User.findOneAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      user: userDB
    });
  });


});

app.delete('/usuario/:id', (req, res) => {
  let id = req.params.id;

  let changeState = {
    status: false
  }

  //ELIMINAR USUARIO EN EL SISTEMAPERO DEJANDOLO EN LA BASE DE DATOS

  User.findOneAndUpdate(id, changeState, { new: true }, (err, userDelete) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    };

    if (!userDelete) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'usuario no encontrado'
        }
      });
    };

    res.json({
      ok: true,
      user: userDelete
    });
  })

  //ELIMINAR USUARIO DE BASE DE DATOS COMPLETAMENTE

  // User.findOneAndRemove(id, (err, userDelete) => {
  //   if (err) {
  //     return res.status(400).json({
  //       ok: false,
  //       err
  //     });
  //   };

  //   if (!userDelete) {
  //     return res.status(400).json({
  //       ok: false,
  //       err: {
  //         message: 'usuario no encontrado'
  //       }
  //     });
  //   };

  //   res.json({
  //     ok: true,
  //     user: userDelete
  //   });
  // })
});

module.exports = app;