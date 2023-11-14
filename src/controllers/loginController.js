const bcrypt = require('bcrypt');


function login(req,res){
    res.render('login/index')
}

function auth(req,res){
    const data = req.body;

    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM users where email = ?',[data.email],(err,userdata)=>{
            if(userdata.length > 0){
                userdata.forEach(element => {
                bcrypt.compare(data.password, element.password, (err,isMatch)=>{
                        if(isMatch){
                            req.session.loggedin = true;
                            req.session.name = element.name;
                            
                            res.redirect('/');

                        }else{
                            
                            res.render('login/index',{error:'Error: incorrect password !'});
                        }
                    });
                })
            }else{
                res.render('login/index',{error: 'Error: User not exists !'});
            }
        }
    )}
)}

function logout(req,res){
    if(req.session.loggedin == true){
        req.session.destroy();
}
        res.redirect('/register');
}

function register(req,res){
    res.render('login/register')
}

function storeUser(req,res){
    const data = req.body;
    console.log(data);
    
    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM users where email = ?',[data.email],(err,userdata)=>{
            if(userdata.length > 0){
                res.render('login/register',{error:'User already exists !'})
            }else{
                bcrypt.hash(data.password, 12).then(hash => {    
                    data.password = hash;
                   
               
                   req.getConnection((err,conn)=>{
                       conn.query('INSERT INTO users SET ?',[data],(err,rows)=>{

                           req.session.loggedin = true;
                           req.session.name = data.name;
                           res.redirect('/')
                       });
                     });      
                   });
            }
        });
    });
} 

module.exports = {
    login: login,
    register: register,
    storeUser: storeUser,
    auth: auth,
    logout: logout,
}