const User = require('../models/User');
const crypto = require('crypto');
const jwtAdder = require("../tools/jwtAdder");

/**
 * Username Regex :
 * At least 5 characters, start with a letter, case insensitive, can contain numbers, '_' '-' '.' and letters
 * @type {RegExp}
 */
const loginRegex = /^[a-z][a-z0-9_\-.]{4,}$/i;
const saltLength = 255;

class AuthenticationController {
  currentUser;


  /**
   * Log a user with given credentials
   * @param req
   * @param res
   * @return {*|Promise<any>}
   * @bodyParam login string
   * @bodyParam password string
   */
  login(req, res) {
    const body = req.body;
    if (!(body.login && body.password)) {
      return res.status(401).json("Requête incomplete");
    }

    const doLogin = optionalUser => {
      const hash = crypto.createHash('sha512', optionalUser.salt);
      hash.update(body.password);
      if (hash.digest('hex') !== optionalUser.password)
        return res.status(400).json({error: "Mot de passe incorrect"});

      jwtAdder(res, {id: optionalUser._id});

      return res.json({success: "Vous êtes connecté !"});
    }

    if (body.login.indexOf('@') !== -1) {
      // Authentication with email
      User.findOne({email: body.login})
        .then(optionalUser => {
          if (!optionalUser) return res.status(400).json({error: "L'adresse email n'existe pas"});

          return doLogin(optionalUser);
        });

    } else {
      // Authentication with password
      User.findOne({username: body.login})
        .then(optionalUser => {
          if (!optionalUser) return res.status(400).json({error: "L'identifiant n'existe pas"});

          return doLogin(optionalUser);
        });
    }
  }

  /**
   * Re gister a user
   * @param req
   * @param res
   * @return {*|Promise<any>}
   * @bodyParam username string
   * @bodyParam password string
   * @bodyParam email string
   */
  register(req, res) {
    const body = req.body;
    // Check request validity
    if (!(body.username && body.password && body.email)) {
      return res.status(400).json({error: "Requête incomplete : ", body: req.body});
    }

    if (!loginRegex.test(body.username)) {
      return res.status(400).json({"error": "Le nom d'utilisateur est incorrect"});
    }

    // Check email unique
    User.findOne({username: body.username})
      .then(optionalUser => {
        if (optionalUser) return res.status(400).json({error: "L'adresse email est déjà utilisée"});

        // check username unique
        User.findOne({email: body.email})
          .then(optionalUser => {
            if (optionalUser) return res.status(400).json({error: "Le nom d'utilisateur est déjà utilisé"});

            // set salt and hash password
            const salt = crypto
              .randomBytes(Math.ceil(saltLength/2))
              .toString('hex')
              .slice(0, saltLength);

            const hash = crypto.createHash('sha512', salt);
            hash.update(body.password);
            const hashedPassword = hash.digest('hex');


            // create the user
            const user = new User({
              username: body.username,
              salt: salt,
              password: hashedPassword,
              email: body.email,
              created: Date.now(),
            });

            user.save((err, user) => {
              if (err) {
                return res.status(500).json({error: "Impossible de créer l'utilisateur", message: err.error})
              }

              jwtAdder(res, {id: user._id});
              return res.json({success: "Votre compte a bien été créé !"});
            })

          });

      });

  }
}

const authenticationController = new AuthenticationController();

module.exports = authenticationController;
