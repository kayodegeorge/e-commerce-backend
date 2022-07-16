const express = require('express')
const mysql = require('mysql')
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors')
saltRounds = 10
const password = 'password'

const db = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: '',
     database: 'onlinestore'
})
db.connect((err) => {
    if(err){
   throw err;
    }
    console.log('Mysql Connected')
})
  
const app = express();
app.use(bodyparser.json());
app.use(cors());



app.get('/', (req, res) => {
    res.send('Opened')
})

app.post('/register', (req, res) => {
    let { firstName, lastName, email, password } = req.body 
    const user = { firstName, lastName, email, password }
    
    // if email exists
    let getEmail = `SELECT email FROM users WHERE email = "${req.body.email}"` 
    let query = db.query(getEmail, (err, results) => {
        console.log(results.length)
        if(results.length > 0){
            res.send('User already exists')
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;
                    let sql = 'INSERT INTO users SET?'
                    let query = db.query(sql, user, (err, result) => {
                        if(err) 
                        throw err
                        console.log(result)
                        res.send('User created')
                    })
                })
                
        
            });
            
        }
    })
    
});




app.post('/login', (req, res) => {
    const { email, password } = req.body

    if (email && password){
        let sql = `SELECT email from users WHERE email = "${req.body.email}"`
        let query = db.query(sql, (err, results) =>{
            if (results.length > 0){
        let dbpassword = `SELECT password from users WHERE email = "${req.body.email}"`
        let query = db.query(dbpassword, (err, results) => {
            if(results.length > 0){
               console.log(results)
               let originalPassword = results[0].password
               console.log(originalPassword)
               bcrypt.compare(password, originalPassword, (err, results) => {
                   if(err) throw err;
                   if(results){
                       res.status(200).send('login successful')
                   } else{
                       res.status(400).send('invalid credentials')
                   }
               }) 
            } else{
                res.status(400).send('invalid credentials')
            } 
        })
            } else{
                res.status(400).send('invalid credentials')
            }
        })

    } else {
        res.status(400).send('incorrect input')
    }
        
  
 })

app.get('/users/:id', (req, res) => {
    let sql = `SELECT * FROM users WHERE userId = ${req.params.id}`
    let query = db.query( sql, (err, result) => {
        if (err)
        throw err
        console.log(result)
        res.send(result)
    })
})

app.get('/users', (req, res) => {
    let sql = "SELECT * FROM users"
    let query = db.query(sql, (err, results) => {
        if(err) throw err
        console.log(results)
        res.send(results) 
    })
})

app.delete('/users/:id', (req, res) => {
    let sql = `DELETE FROM users WHERE userId = ${req.params.id}`
    let query = db.query(sql, (err, result) => {
        if(err) throw err
        console.log(result)
        res.send('user deleted')
    })
})

app.put('/users/:id', (req, res) => {
    let id  = req.params.id
    let firstName = req.body.firstName
    let lastName = req.body.lastName
    let sql = `UPDATE users SET firstName = '${firstName}', lastName='${lastName}' WHERE userId = ${id}`
    let query = db.query(sql, (err, result) => {
        if(err) throw err
        console.log(result)
        res.send('User updated')
    })
})

app.put('/resetpassword/:id', (req, res) => {
    const { oldpassword, newpassword } = req.body 
    let sql = `SELECT * FROM users WHERE userId = "${req.params.id}"`
    let query = db.query(sql, (err, result) =>{
        if(err) throw err
        if(result[0].password == req.body.oldpassword){
            let sql = `UPDATE users SET password = '${newpassword}' WHERE userId = ${req.params.id}`
        let query = db.query(sql, (err, result) => {
            if(err) throw err
            console.log(result)
            res.send('Password reseted')
        }) 
        } else {
            res.status(400).send('Old password not correct')
        }
              
    })
    
})

// ---------------------------------------------------------BUSINESSES--------------------------------------------------------------------------------
app.post('/businesses', (req, res) => {
    let { companyName, typeOfBusiness, userId} = req.body
    const business = { companyName, typeOfBusiness, userId}
    console.log(req.body)
    if (companyName && typeOfBusiness && userId){
        let sql = 'INSERT INTO businesses (companyName, typeOfBusiness, userId) VALUES ( "'+req.body.companyName+'" , "'+req.body.typeOfBusiness+'", "'+req.body.userId+'")'
    let query = db.query(sql, business, (err, results) => {
    if(err) {
        throw err
    } else {
        console.log(results)
        res.status(200).send('Business Added')
    }    
})
    } else{
        res.status(400).send('bad request')
    }
    
})

app.get('/businesses', (req, res) => {
    let business_id = req.params.id
    let sql = 'select * FROM businesses'
    let query = db.query(sql, (err, results) => {
        if (err){
            throw err
        } else {
            res.send(results)
        }
 
    })
 })

app.get('/businesses/:id', (req, res) => {
   let business_id = req.params.id
   let sql = 'select * FROM businesses where businessid = "'+business_id+'" '
   let query = db.query(sql, (err, results) => {
       if (err){
           throw err
       } else {
           res.send(results)
       }

   })
})

app.put('/businesses/:id', (req, res) => {
    const {oldCompanyName, newCompanyName} = req.body
    let sql = `select * from businesses where businessId = "${req.params.id}"`
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err
        } else {
            let sql = `update businesses set companyName = '${newCompanyName}' where businessId = "${req.params.id}"` 
            let query = db.query(sql, (err, result) =>{
                if(err){
                    throw err
                } else{
                    res.status(200).send('Company name updated')
                }
            })
        } 
    })
})

app.delete('businesses/:id', (req, res) =>{
    let sql = `delete from businesses where businessId = ${req.params.id}`
    let query = db.query( sql, (err, result)=>{
        if(err){
            throw err
        } else {
            res.status(200).send('user deleted')
        }
    })
})

//----------------------------------------PRODUCTS------------------------------------
app.post('/products', (req, res) => {
    let {productDescription, imageUrl, price, businessId, userId} = req.body
    const product = {productDescription, imageUrl, price, businessId, userId}
    console.log(req.body)
    let sql = `insert into products (productDescription, imageUrl, price, businessId, userId) values ("${req.body.productDescription}", "${req.body.imageUrl}", "${req.body.price}", "${req.body.businessId}", "${req.body.userId}")`
    let query = db.query(sql, product, (err,results) => {
        if(err){
            throw err
        } else{
            res.status(200).send('product added successfully')
        }
    })
})

app.get('/products', (req, res) => {
    let product_id = req.params.id
    let sql = 'select * from products'
    let query = db.query(sql, (err, results) => {
        if(err){
            throw err
        } else{
            res.send(results)
        }
    })
})

app.get('/products/:id', (req, res) => {
    let product_id = req.params.id
    let sql = `select * from products where productId = "${product_id}"`
    let query = db.query(sql, (err, result) =>{
        if(err){
            throw err
        } else{
            res.send(result)
        }
    })
}) 

app.put('/products/:id', (req, res) => {
    const {oldPrice, newPrice} = req.body
    const {oldProductDescription, newProductDescription} = req.body
    const {oldImageUrl, newImageUrl} = req.body
    let sql = `select * from products where productId  = "${req.params.id}"`
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err
        } else {
            let sql = `update products set price = "${newPrice}", productDescription = "${newProductDescription}", imageUrl = "${newImageUrl}" where productId = "${req.params.id}"`
            let query = db.query(sql, (err, result) => {
                if (err){
                    throw err
                } else{
                    console.log(result)
                    res.status(200).send('Updated successfully')
                }
            })
        }
    })

})

app.delete('/products/:id', (req, res) => {
    let sql = `delete from products where productId = "${req.params.id}"`
    let query = db.query(sql, (err, result)=>{
        if(err){
            throw err
        } else {
            res.status(200).send('product deleted')
        }
    })
})
//------------------------------------------ORDERS!-----------------------------------


app.post('/orders', (req, res) => {
    let { dispatchOptions, clientLocation, orderSummary, userId} = req.body
    const order = { dispatchOptions, clientLocation, orderSummary, userId}
    console.log(req.body)
    let sql = `insert into orders (dispatchOptions, clientLocation, orderSummary, userId) values ("${req.body.dispatchOptions}", "${req.body.clientLocation}", "${req.body.orderSummary}", "${req.body.userId}")`
    let query = db.query(sql, order, (err, results) => {
        if(err){
            throw err
        } else {
            res.status(200).send('your order has been added!')
        }
    })
})

app.get('/orders', (req, res) => {
    let order_id = req.params.id
    let sql = 'select * from orders'
    let query = db.query(sql, (err, results) => {
        if(err){
            throw err
        } else{
            res.send(results)
        }
    })
})

app.get('/orders/:id', (req, res) => {
    let order_id = req.params.id
    let sql = `select * from orders where orderId = "${order_id}"`
    let query = db.query(sql, (err, result) =>{
        if(err){
            throw err
        } else{
            res.send(result)
        }
    })
}) 

app.delete('/orders/:id', (req, res) => {
    let sql = `delete from orders where orderId = "${req.params.id}"`
    let query = db.query(sql, (err, result)=>{
        if(err) throw err
        console.log(result)
        res.send('order deleted')
    })

})


 
app.listen('8000', () => {
    console.log("Server running on port 8000")
})
