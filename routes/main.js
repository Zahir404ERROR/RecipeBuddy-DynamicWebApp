module.exports = function (app, shopData) {
    const redirectLogin = (req, res, next) => {
        if (!req.session.userId) {
            res.redirect('./login')
        } else { next(); }
    }

    const { check, validationResult } = require('express-validator');

    // Handle our routes

    // Home Page
    app.get('/', function (req, res) {
        usrId = req.session.userId;
        let newData = Object.assign({}, shopData, usrId);
        res.render('index.ejs', newData)
    });

    // About Page
    app.get('/about', function (req, res) {
        res.render('about.ejs', shopData);
    });

    // Search Books
    app.get('/search', redirectLogin, function (req, res) {
        res.render("search.ejs", shopData);
    });

    app.get('/search-result',
        [
            // Validation
            check('keyword')
                .notEmpty()
                .isAlphanumeric('en-US', { ignore: '\s' })
        ],
        function (req, res) {
            //searching in the database
            // Validation Error Redirect
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.redirect('./search');
            }
            else {
                //res.send("You searched for: " + req.query.keyword);
                let sqlquery = "SELECT * FROM foods WHERE name LIKE '%" + req.sanitize(req.query.keyword) + "%'"; // query database to get all the books
                // execute sql query
                db.query(sqlquery, (err, result) => {
                    if (err) {
                        res.redirect('./');
                    }
                    let newData = Object.assign({}, shopData, { availableBooks: result });
                    res.render("listFood.ejs", newData)
                });
            }
        });

    // List Food
    app.get('/listfood', function (req, res) {
        let sqlquery = "SELECT * FROM foods"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, { availableBooks: result });
            res.render("listFood.ejs", newData)
        });
    });

    // Calculate nutritional information of a recipe or a meal
    app.post('/calculatenutri', function (req, res) {
        var ids = req.body.selected;
        var quantity=[];
        var vlsper =[];
        var unit =[];
        var carbs =[];
        var fat =[];
        var protein =[];
        var salt =[];
        var sugar =[];
        var carbssum=0;
        var fatssum = 0;
        var proteinsum = 0;
        var saltsum = 0;
        var sugarsum = 0;
        
        for (var i=0;i<ids.length;i++) {
            var x = ids[i].split(",");
            var id = 'req.body.quantity_'+ x[0];
            quantity.push(parseInt(eval(id)));
            vlsper.push(parseInt(x[2]));
            unit.push(parseInt(x[3]));
            carbs.push(parseInt(x[4]));
            fat.push(parseInt(x[5]));
            protein.push(parseInt(x[6]));
            salt.push(parseInt(x[7]));
            sugar.push(parseInt(x[8]));
        }
        for (let index = 0; index < carbs.length; index++) {
            carbssum = carbssum + (carbs[index])*quantity[index];       
            fatssum = fatssum + (fat[index])*quantity[index];
            proteinsum = proteinsum + (protein[index])*quantity[index];
            saltsum = saltsum + (salt[index])*quantity[index];
            sugarsum = sugarsum + (sugar[index])*quantity[index];
        }
        
        let newData = Object.assign({},carbssum, fatssum, proteinsum, saltsum, sugarsum);
        console.log(carbssum);
        // User Feedback  
        result = 'Carbs Total : ' + carbssum + '<br> Fats Total : ' + fatssum + '<br>Protein Total : ' + proteinsum + '<br>Salt Total : ' + saltsum + '<br>Sugar Total : ' + sugarsum ;
        // Stylesheets
        result += '<link rel="stylesheet"  type="text/css" href="main.css" />'
        // Quick Links for navigation
        result += '<p><a href="listfood">Back</a></p> <p><a href="./">Home</a></p>';
        res.send(result);
        //res.render("recipe.ejs", newData)
    });

    // Update Food
    app.get('/updatefood', redirectLogin, function (req, res) {
        res.render("updateFood.ejs", shopData);
    });

    app.get('/updatefood-result',
        [
            // Validation
            check('keyword')
                .notEmpty()
                .isAlphanumeric('en-US', { ignore: '\s' })
        ],
        function (req, res) {
            //searching in the database
            // Validation Error Redirect
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.redirect('./search');
            }
            else {
                //res.send("You searched for: " + req.query.keyword);
                let sqlquery = "SELECT * FROM foods WHERE name LIKE '%" + req.sanitize(req.query.keyword) + "%' AND user = '"+req.sanitize(req.session.userId)+"'"; // query database to get all the books
                // execute sql query
                db.query(sqlquery, (err, result) => {
                    if (err) {
                        res.redirect('./');
                    }
                    let newData = Object.assign({}, shopData, { availableBooks: result });
                    res.render("updatefood-result.ejs", newData)
                });
            }
    });

    app.post('/foodupdater',
    [
        // Validation
        check('name')
            .notEmpty()
            .isAlphanumeric('en-US', { ignore: '\s' }),
        check('valuesper')
            .notEmpty()
            .isNumeric(),
        check('unit')
            .notEmpty()
            .isAlphanumeric('en-US', { ignore: '\s' }),
        check('carbs')
            .notEmpty()
            .isNumeric(),
        check('fat')
            .notEmpty()
            .isNumeric(),
        check('protein')
            .notEmpty()
            .isNumeric(),
        check('salt')
            .notEmpty()
            .isNumeric(),
        check('sugar')
            .notEmpty()
            .isNumeric(),
    ], function (req, res) {
        // Validation Error Redirect
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./addfood');
        }
        else {
            // saving data in databaseS
            let sqlquery = "UPDATE foods SET valuesper = ?, unit= ?, carbs = ?, fat = ?, protein = ?, salt = ?, sugar= ? WHERE name = ?";
            // execute sql query
            let newrecord = [req.sanitize(req.body.valuesper), req.sanitize(req.body.unit), req.sanitize(req.body.carbs), 
                            req.sanitize(req.body.fat), req.sanitize(req.body.protein), req.sanitize(req.body.salt), req.sanitize(req.body.sugar), 
                            req.sanitize(req.body.name)];
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return console.error(err.message);
                }
                else
                    res.send('<link rel="stylesheet"  type="text/css" href="main.css" />' +
                        ' This food is added to database, name: ' + req.sanitize(req.body.name) +
                        '<p><a href="addbook">Back</a></p> <p><a href="./">Home</a></p>');
            });
        }
    });

    app.post('/delete', function (req, res) {
        let sqlquery = "DELETE FROM foods WHERE id = '" + req.body.id + "'"; 
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            else {
                // User Feedback  
                result = 'The usere entered has been successfully deleted from the database ( Username : ' + req.body.name + ')';
                // Stylesheets
                result += '<link rel="stylesheet"  type="text/css" href="main.css" />'
                // Quick Links for navigation
                result += '<p><a href="deleteusers">Back</a></p> <p><a href="./">Home</a></p>';
                res.send(result);
            }
        });
    });

    // Add food
    app.get('/addfood', redirectLogin, function (req, res) {
        res.render('addFood.ejs', shopData);
    });

    app.post('/foodadded',
        [
            // Validation
            check('name')
                .notEmpty()
                .isAlphanumeric('en-US', { ignore: '\s' }),
            check('valuesper')
                .notEmpty()
                .isNumeric(),
            check('unit')
                .notEmpty()
                .isAlphanumeric('en-US', { ignore: '\s' }),
            check('carbs')
                .notEmpty()
                .isNumeric(),
            check('fat')
                .notEmpty()
                .isNumeric(),
            check('protein')
                .notEmpty()
                .isNumeric(),
            check('salt')
                .notEmpty()
                .isNumeric(),
            check('sugar')
                .notEmpty()
                .isNumeric(),
        ], function (req, res) {
            // Validation Error Redirect
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.redirect('./addfood');
            }
            else {
                // saving data in databaseS
                let sqlquery = "INSERT INTO foods (name, valuesper, unit, carbs, fat, protein, salt, sugar, user) VALUES (?,?,?,?,?,?,?,?,?)";
                // execute sql query
                let newrecord = [req.sanitize(req.body.name), req.sanitize(req.body.valuesper), req.sanitize(req.body.unit), req.sanitize(req.body.carbs), 
                                req.sanitize(req.body.fat), req.sanitize(req.body.protein), req.sanitize(req.body.salt), req.sanitize(req.body.sugar), 
                                req.sanitize(req.session.userId)];
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    else
                        res.send('<link rel="stylesheet"  type="text/css" href="main.css" />' +
                            ' This food is added to database, name: ' + req.sanitize(req.body.name) +
                            '<p><a href="addbook">Back</a></p> <p><a href="./">Home</a></p>');
                });
            }
        });

    // User Registration
    app.get('/register', function (req, res) {
        res.render('register.ejs', shopData);
    });

    app.post('/registered', [
        // Validation - Email, Password, User, Name and Last Name
        check('email').isEmail(),
        check('pass').isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            returnScore: false,
            pointsPerUnique: 1,
            pointsPerRepeat: 0.5,
            pointsForContainingLower: 10,
            pointsForContainingUpper: 10,
            pointsForContainingNumber: 10,
            pointsForContainingSymbol: 10
        }),
        check('user')
            .notEmpty()
            .isLength({ max: 15 })
            .isAlphanumeric('en-US', { ignore: '\s' }),
        check('first')
            .notEmpty()
            .isAlpha('en-US', { ignore: '\s' }),
        check('last')
            .notEmpty()
            .isAlpha('en-US', { ignore: '\s' })
    ], function (req, res) {
        // Validation Error Redirect
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./register');
        }
        else {
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const plainPassword = req.body.pass;

            // Hash Passwords
            bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
                // query database to register user with hashed password
                let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedpassword) VALUES (?,?,?,?,?)";
                // execute sql query
                let newrecord = [req.sanitize(req.body.user), req.sanitize(req.body.first),
                req.sanitize(req.body.last), req.sanitize(req.body.email),
                req.sanitize(hashedPassword)];
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        // Error Handling
                        return console.error(err.message);
                    }
                    else
                        // User Feedback    
                        result = 'Hello ' + req.sanitize(req.body.first) + ' ' + req.sanitize(req.body.last) +
                            ' you are now registered! We will send an email to you at ' + req.sanitize(req.body.email);
                    result += ' Your hashed password is: ' + req.sanitize(hashedPassword);
                    // Stylesheets
                    result += '<link rel="stylesheet"  type="text/css" href="main.css" />'
                    // Quick Links for navigation
                    result += '<p><a href="register">Back</a> </p> <p><a href="./">Home</a></p>';
                    res.send(result);
                });
            })
        }
    });

    // User Login
    app.get('/login', function (req, res) {
        res.render('login.ejs', shopData);
    });

    app.post('/loggedin', [
        // Validation
        check('user')
            .notEmpty()
            .isAlphanumeric('en-US', { ignore: '\s' }),
        check('pass').notEmpty()
    ], function (req, res) {
        // Validation Error Redirect
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./login');
        }
        else {
            // Compare the password supplied with the password in the database
            let sqlquery = "SELECT * FROM users WHERE username = '" + req.sanitize(req.body.user) + "'";
            // execute sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./');
                }
                else if (result.length == 0) {
                    // incorrect User Password Feedback
                    result = 'The username you entered is incorrect';
                    // Stylesheets
                    result += '<link rel="stylesheet"  type="text/css" href="main.css" />'
                    // quick Links for navigation
                    result += '<p><a href="login">Back</a></p> <p><a href="./">Home</a></p>';
                    res.send(result);
                }
                else {
                    const bcrypt = require('bcrypt');
                    const saltRounds = 10;
                    const hashPassword = result[0].hashedpassword;
                    bcrypt.compare(req.body.pass, hashPassword, function (err, bcryptresult) {
                        if (err) {
                            // Error Handling
                            return console.error(err.message);
                        }
                        else if (bcryptresult == true) {
                            req.session.userId = req.body.user;
                            // Successful User Login Feedback
                            bcryptresult = '<link rel="stylesheet"  type="text/css" href="main.css" />';
                            // Stylesheets
                            bcryptresult += 'Hello ' + req.sanitize(req.body.user) + ' you have successfully logged in!'
                            // Quick Links for navigation
                            bcryptresult += '<p><a href="login">Back</a></p> <p><a href="./">Home</a></p>';
                            res.send(bcryptresult);
                        }
                        else {
                            // Incorrect User Password Feedback
                            bcryptresult = 'Hello ' + req.sanitize(req.body.user) + ' the password you entered is incorrect!';
                            // Stylesheets
                            bcryptresult += '<link rel="stylesheet"  type="text/css" href="main.css" />'
                            // Quick Links for navigation
                            bcryptresult += '<p><a href="login">Back</a></p> <p><a href="./">Home</a></p>';
                            res.send(bcryptresult);
                        }
                    });
                }
            });
        }
    });

    // User Logout
    app.get('/logout', redirectLogin, (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('./')
            }
            res.send('<link rel="stylesheet" type="text/css" href="main.css" /> You are now logged out. <p><a href=' + './' + '>Home</a> </p>');
        })
    })

    // API and API keyword Search
    app.get('/api', function (req, res) {
        // Query database to get all the books
        let key = req.query.keyword;
        if (key != undefined) {
            console.log(key);
            let sqlquery = "SELECT * FROM foods WHERE name LIKE '%" + key + "%'";
            // Execute the sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.send('<link rel="stylesheet" type="text/css" href="main.css" /> <p><a href=' +
                        './' + '>Home</a> </p>' + 'Could not find any book like that unfortunately');
                }
                // Return results as a JSON object
                res.json(result);
            });
        } else {
            let sqlquery = "SELECT * FROM foods";
            // Execute the sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./');
                }
                // Return results as a JSON object
                res.json(result);
            });
        }

    });
}