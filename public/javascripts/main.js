// let checkInText ='You Checked In here on: ' +checkins[0].date;

function setHealthUserSession(){

  var xhttp = new XMLHttpRequest();
  var user_alt=document.getElementById('user_id').value;

  if (!user_alt){
    document.getElementById('error').style.color = "red";
    document.getElementById('error').innerText = "Please enter a User ID";
    return false;
  }

  var formData={"user_alt":user_alt};

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4){
        if ( this.status == 200) {
          console.log("user alt posted");
        }
        if (this.status == 400){
          document.getElementById('error').style.color = "red";
          document.getElementById('error').innerText = "Please enter a valid User email";
        }
        if (this.status == 500){
          document.getElementById('error').style.color = "red";
          document.getElementById('error').innerText = "Internal Server Error";
        }

    }
  };

  xhttp.open("POST", "/home/user_alt", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(formData));

}

function setHealthBusinessSession(){

  var xhttp = new XMLHttpRequest();
  var business_alt=document.getElementById('business_id').value;

  if (!business_alt){
    console.log("no text");
    return false;
  }

  var formData={"business_alt":business_alt};
  console.log(business_alt);
  console.log(formData);

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4){
        if ( this.status == 200) {
          console.log("business alt posted");
        }
        if (this.status == 400){
          document.getElementById('error').style.color = "red";
          document.getElementById('error').innerText = "Please enter a valid Business Code";
        }
        if (this.status == 500){
          document.getElementById('error').style.color = "red";
          document.getElementById('error').innerText = "Internal Server Error";
        }

    }
  };

  xhttp.open("POST", "/home/manage-business/business_alt", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(formData));

}

// Function for the Back/Cancel button on pages, will send the window back to whatever the previous page was.
function goBack() {
  window.history.back();
}

var positive = document.getElementById('capacity');


// function which hides and shows table/map
function toggleView() {
  if (document.getElementById('map')) {
    if (document.getElementById('map').style.display == 'none')
    {
        document.getElementById('map').style.display = 'block';
        document.getElementById('TableV').style.display = 'none';
    }
    else
    {
        document.getElementById('map').style.display = 'none';
        document.getElementById('TableV').style.display = 'block';
    }
  }
}

// function which swaps user/business search
function toggleSearch() {
  var business_id = document.getElementById('business_id');
  var label = document.getElementById('labelLookup');
  var user;
  if (business_id){ //.id == 'business_id') {
    business_id.id = 'user_id';
    label.innerText = 'User ID:';
    business_id.placeholder = 'User ID';
  }
  else
  {
    user = document.getElementById('user_id');
    user.id = 'business_id';
    label.innerText = 'Business ID:';
    user.placeholder = 'Business ID';
  }
}


// gives the chosen user health offical status
function makeAdmin(){
  user.health_official= true;
  if (user.health_official== true){
    alert("Health Offical Signed Up!");
    refresh();
  }
  else {
    alert("Failed");
    refresh();
  }


}
// reloads the page
function refresh(){
  location.reload();
  return false;
}

function loadUserAccount() {

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var res = JSON.parse(xhttp.responseText);
      document.getElementById('userAccount_h1_name').innerText = res.given_name +  " " + res.last_name;
      if (res.business_owner) {
        document.getElementById('business_info_btn').style.visibility = 'visible';
      }
      if (res.health_official) {
        document.getElementById('health_official_btn').style.visibility = 'visible';
      }
    }
  };

  xhttp.open("GET", "/home/name", true);
  xhttp.send();

}

function makeHotspot() {

  var code = {code: document.getElementById('bcode').value};

  if(!code) {
    document.getElementById('error').style.color = "red";
    document.getElementById('error').innerText = "Please enter a code";
  }

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4)
      document.getElementById('bcode').value = "";
      if(this.status == 200) {
        document.getElementById('error').style.color = "green";
        document.getElementById('error').innerText = "Successfully created hotspot";
      }
      else if(this.status == 400) {
        document.getElementById('error').style.color = "red";
        document.getElementById('error').innerText = "Invalid code";
      }
      else if(this.status == 406) {
        document.getElementById('error').style.color = "red";
        document.getElementById('error').innerText = "Business is already a hotspot";
      }
  };

  xhttp.open("POST", "/home/health-official/manage-hotspots", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(code));

}

function loadBusinessDetails() {

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var b = JSON.parse(xhttp.responseText);
      document.getElementById('editBusiness_name').value = b.name;
      document.getElementById('b_type').value = b.industry;
      document.getElementById('editBusiness_email').value = b.email;
      document.getElementById('editBusiness_phone').value = b.number;
      document.getElementById('capacity').value = b.capacity;
      document.getElementById('editBusiness_address_no').value = b.address_no;
      document.getElementById('editBusiness_address_street').value = b.address_street;
      document.getElementById('editBusiness_address_suburb').value = b.address_suburb;
      document.getElementById('editBusiness_address_state').value = b.address_state;
      document.getElementById('editBusiness_address_postcode').value = b.address_postcode;
    }
  };

  xhttp.open("GET", "/home/manage-business/business-details/details", true);
  xhttp.send();

}

function setBusinessSession(code){

  var xhttp = new XMLHttpRequest();

  var formData={"code":code};

  xhttp.open("POST", "/home/manage-business/business-details/code", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(formData));

}

// manage-business page
function loadBusinesses() {

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var businesses = JSON.parse(xhttp.responseText);
      businesses.forEach(name =>{

        var ck_in = '<button id="bizbtn" class="manageBusiness_b margin" ' +'name="'+name.code+'"  onclick="window.location.href =&#39;/home/manage-business/check-in-history&#39; ; setBusinessSession(&#39;'+name.code+'&#39;);">Check-In History</button>';
        var ed_biz ='<button id="bizbtn" class="manageBusiness_b margin" ' +'name="'+name.code+'"  onclick="window.location.href =&#39;/home/manage-business/business-details&#39; ; setBusinessSession(&#39;'+name.code+'&#39;);">Edit Business Info</button>';

        document.getElementById("BUZI").innerHTML += name.business_name+" | "+name.code + "<br>" + ck_in + ed_biz + "<br>";

      });

    }
  };

  xhttp.open("GET", "/home/manage-business", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send();

}

function loadUserDetails() {

  var xhttp = new XMLHttpRequest();

  // ssn=req.session;

  //   if(ssn.user_alt) {
  //       document.getElementById('passwords').style.visibility == 'hidden';
  //   } else {
  //       document.getElementById('passwords').style.visibility == 'visible';
  //   }

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var res = JSON.parse(xhttp.responseText);
      document.getElementById('editPersonal_fname').value = res.given_name;
      document.getElementById('editPersonal_lname').value = res.last_name;
      document.getElementById('editPersonal_email').value = res.email;
      document.getElementById('editPersonal_mobile').value = res.mobile_number;
    }
  };

  xhttp.open("GET", "/home/account-details/details", true);
  xhttp.send();

}

function loadResultsAccount() {
  document.getElementById('lookUpResults_h1_name').innerText = user.given_name + " " + user.last_name;
}

function checkIn() {

  var code = document.forms["checkIn-form"]["code"].value;
  if(!code) {
    document.getElementById('error').style.color = "red";
    document.getElementById('error').innerText = "Please enter a code";
    return;
  }

  document.getElementById('error').innerText = "";

  var date = new Date();
  date = date.toISOString();

  var formData = {"id": code, "date": date};

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4) {
      if(this.status == 200) {
        document.getElementById('error').style.color = "green";
        document.getElementById('error').innerText = "Successfully checked in";
      }
      else if(this.status == 400) {
        document.getElementById('error').style.color = "red";
        document.getElementById('error').innerText = "Invalid code, please try again";
      }
      else if(this.status == 500) {
        document.getElementById('error').style.color = "red";
        document.getElementById('error').innerText = "Server error";
      }
    }
  };

  xhttp.open("POST", "/home/check-in", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(formData));

}

function makeHealthOfficial() {
  user.health_official = true;
}

function printChangesSaved(){
    document.getElementById('saveChange').innerText = "Changes Saved!";
    document.getElementById('saveChange').style.color = "blue";
}

function businessCheckinHistory() {

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var res = JSON.parse(xhttp.responseText);
      var name = res.name;
      var dates = res.dates;

      document.getElementById("bname").innerText = name + " Check-in History";
      for(i=0;i<dates.length;i++) {
        var newDate = new Date(dates[i]);
        var row = '<tr><td>'+newDate.getHours()+':'+newDate.getMinutes()+'</td><td>'+newDate.getDate()+ '/' + (newDate.getMonth()+1) + '/'+ newDate.getFullYear() + '</td><tr>';
        document.getElementById("bhistory").innerHTML += row;
      }
    }
  };

  xhttp.open("GET", "/home/manage-business/check-in-history/history", true);
  xhttp.send();
}

function updatePersonal(){

  var given_name = document.getElementById('editPersonal_fname').value;
  var last_name = document.getElementById('editPersonal_lname').value;
  var email = document.getElementById('editPersonal_email').value;
  var mobile_number = document.getElementById('editPersonal_mobile').value;
  var current_password = document.getElementById('editPersonal_cpass').value;
  var new_password = document.getElementById('editPersonal_npass').value;
  var confirm_password = document.getElementById('verifyPersonal_vpass').value;
  var notifications = document.getElementById('notifications');

  if(notifications.checked == true) {
    notifications = true;
  }
  else {
    notifications = false;
  }

  console.log(notifications);

  if(!(given_name && last_name && email && mobile_number)) {
    document.getElementById('error').innerText = "Your personal details cannot be blank";
    document.getElementById('error').style.color = "red";
    return;
  }

  if(!(current_password)) {
    document.getElementById('error').innerText = "Please enter your password";
    document.getElementById('error').style.color = "red";
    return;
  }

  if(new_password == confirm_password) {
    var xhttp = new XMLHttpRequest();

    document.getElementById('error').innerText = "";

    var formData = {"given_name": given_name, "last_name": last_name, "email": email, "mobile_number": mobile_number, "notifications": notifications, "current_password": current_password, "new_password": new_password};

    xhttp.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        var res = xhttp.responseText;
        if(res == undefined) {
          document.getElementById('error').innerText = "Error updating";
          document.getElementById('error').style.color = "red";
        }
        document.getElementById('error').innerText = "";
        window.location.href='/home';
      } else if (this.status == 401) {
        document.getElementById('error').innerText = res;
        document.getElementById('error').style.color = "red";
      }
    };

    xhttp.open("POST", "/home/account-details", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(formData));
  }
  else{
    document.getElementById('error').innerText = "Passwords do not match";
    document.getElementById('error').style.color = "red";
  }
}

function updateBusiness(){

  var business_name = document.getElementById('editBusiness_name').value;
  var industry = document.getElementById('b_type').value;
  var email = document.getElementById('editBusiness_email').value;
  var phone = document.getElementById('editBusiness_phone').value;
  var capacity = document.getElementById('capacity').value;
  var address_no = document.getElementById('editBusiness_address_no').value;
  var address_street = document.getElementById('editBusiness_address_street').value;
  var address_suburb = document.getElementById('editBusiness_address_suburb').value;
  var address_state = document.getElementById('editBusiness_address_state').value;
  var address_postcode = document.getElementById('editBusiness_address_postcode').value;


  if(!(business_name && b_type && email && phone && capacity && address_no && address_street && address_suburb && address_state && address_postcode)) {
    document.getElementById('error').innerText = "Your business details cannot be blank";
    document.getElementById('error').style.color = "red";
    return;
  }

  var xhttp = new XMLHttpRequest();

  document.getElementById('error').innerText = "";

  var formData = {"business_name": business_name,
                  "industry": industry,
                  "business_email": email,
                  "phone_number": phone,
                  "persons_capacity": capacity,

                  "address_no": address_no,
                  "address_street": address_street,
                  "address_suburb": address_suburb,
                  "address_state": address_state,
                  "address_postcode": address_postcode
  };
  console.log(formData);
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      // document.getElementById('error').innerText = "";
      window.location.href='/home/manage-business';
    }
  };

  xhttp.open("POST", "/home/manage-business/business-details", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(formData));
  // else{
  //   document.getElementById('error').innerText = "Passwords do not match";
  //   document.getElementById('error').style.color = "red";
  // }
}

function addBusiness() {

  console.log("Entering this");

  var name = document.getElementById('bname').value;
  var type = document.getElementById('btype').value;
  var email = document.getElementById('addBusiness_email').value;
  var phone = document.getElementById('addBusiness_phone').value;

  var street_no = document.getElementById('addBusiness_address_no').value;
  var street_name = document.getElementById('addBusiness_address_name').value;
  var suburb = document.getElementById('addBusiness_address_suburb').value;
  var state = document.getElementById('addBusiness_address_state').value;
  var postcode = document.getElementById('addBusiness_address_postcode').value;

  var capacity = document.getElementById('capacity').value;
  var code = document.getElementById('code').value;

  if(!name) {
    document.getElementById('error').innerText = "Enter a business name";
    document.getElementById('error').style.color = "red";
    return;
  }
  if(type == "Default") {
    document.getElementById('error').innerText = "Select a business type";
    document.getElementById('error').style.color = "red";
    return;
  }
  if(!email) {
    document.getElementById('error').innerText = "Enter a business email";
    document.getElementById('error').style.color = "red";
    return;
  }
  if(!phone) {
    document.getElementById('error').innerText = "Enter a phone number";
    document.getElementById('error').style.color = "red";
    return;
  }

  if(!street_no) {
    document.getElementById('error').innerText = "Enter a street number";
    document.getElementById('error').style.color = "red";
    return;
  }
  if(!street_name) {
    document.getElementById('error').innerText = "Enter a street name";
    document.getElementById('error').style.color = "red";
    return;
  }
  if(!suburb) {
    document.getElementById('error').innerText = "Enter a suburb";
    document.getElementById('error').style.color = "red";
    return;
  }
  if(!state) {
    document.getElementById('error').innerText = "Enter a state";
    document.getElementById('error').style.color = "red";
    return;
  }
  if(!postcode) {
    document.getElementById('error').innerText = "Enter a postcode";
    document.getElementById('error').style.color = "red";
    return;
  }

  if(!capacity || capacity < 1) {
    document.getElementById('error').innerText = "Select a capacity greater than 0";
    document.getElementById('error').style.color = "red";
    return;
  }
  if(!code) {
    document.getElementById('error').innerText = "Enter a code";
    document.getElementById('error').style.color = "red";
    return;
  }

  var xhttp = new XMLHttpRequest();

  document.getElementById('error').innerText = "";

  var formData = {"business_name": name, "business_type": type, "business_email": email, "phone_number": phone,
                  "street_number": street_no, "street_name": street_name, "suburb": suburb, "state": state, "postcode": postcode,
                  "capacity": capacity, "code": code};

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4) {
      if(this.status == 200) {
        document.getElementById('error').innerText = "";
        window.location.href='/home';
        return;
      }
      else if(this.status == 400) {
        document.getElementById('error').innerText = "Please complete all fields";
        document.getElementById('error').style.color = "red";
        return;
      }
      else if(this.status == 401) {
        document.getElementById('error').innerText = "Business code has been taken";
        document.getElementById('error').style.color = "red";
        return;
      }
      else if(this.status == 403) {
        document.getElementById('error').innerText = "Business code not valid";
        document.getElementById('error').style.color = "red";
        return;
      }
      else if(this.status == 500) {
        document.getElementById('error').innerText = "Server error";
        document.getElementById('error').style.color = "red";
        return;
      }
    }
  };

  xhttp.open("POST", "/home/add-business", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(formData));

}

/*function updateFieldValues(){
  need a server up and running to which i can send the form.
}
/*forEditPersonal^*/

var vueinst = new Vue({
    el: '#app',
    data: {
      words:null,
      given_name: null,
      last_name: null,
      mobile_number: null,
      password: null,
      confpassword:null,
      email: null,
      errors: [],
      business_check_ins: [{date: "1", time: "2"}]
    },
    methods:{
      //checks is the email exists, and respods with their first, last name & email
      doesExist: function (e){
        this.errors = [];
        if (!this.words){
            alert("email required");
            return false;
        }

        var formData = {"email": this.words};
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if(this.readyState == 4  ){

              if (this.status == 200) {
                var res = JSON.parse(xhttp.responseText);
                var f_name= res.given_name;
                var l_name= res.last_name;
                document.getElementById("health_FName").insertAdjacentHTML('beforeend', f_name);
                document.getElementById('health_LName').insertAdjacentHTML('beforeend', l_name);
                document.getElementById('hidden').style.display = 'block';
                }
                if (this.status == 400){
                  document.getElementById("error").innerText="Failed to make health official";
                  document.getElementById('error').style.color = "red";
                  // alert("No such email exists!");
                }
                if (this.status == 201){
                  document.getElementById("error").innerText="User already admin";
                  document.getElementById('error').style.color = "red";
                  // alert("This user is already an Admin!");
                }
                }
        };
        xhttp.open("POST", "/home/health-official/add-health-official/email", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(formData));
      },

      makeH_Admin: function (e){
        var formData = {"email": this.words};
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if(this.readyState == 4  ){
              if (this.status==200){
                document.getElementById("error").innerText="Succuessful admin privileges granted";
                document.getElementById('error').style.color = "green";
              }
              else {
                document.getElementById("error").innerText="Failed to make health official";
                document.getElementById('error').style.color = "red";
              }
            }};
        xhttp.open("POST", "/home/health-official/add-health-official/admin", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(formData));
      },



      // SIGNUP
      checkSignUp: function (e) {
        this.errors = [];
        if(this.given_name && this.last_name && this.email && this.mobile_number && this.password && this.confpassword) {
           if(this.password != this.confpassword) {
             this.errors.push('Passwords do not match');
           }
           else {
            let temp = this;

            var xhttp = new XMLHttpRequest();
            var formData = {given_name: this.given_name,
                            last_name: this.last_name,
                            email: this.email,
                            mobile_number: this.mobile_number,
                            password: this.password};
            xhttp.onreadystatechange = function() {
              if(this.readyState == 4) {
                if(this.status == 200) {
                  window.location.href='/home';
                }
                else if(this.status == 400) {
                  temp.errors.push('Email already in use');
                }
              }
            };

            xhttp.open("POST", "/signup", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify(formData));

           }
        }
        else {
          if(!this.given_name) {
            this.errors.push('Given Name Required');
          }
          if(!this.last_name) {
            this.errors.push('Last Name Required');
          }
          if(!this.email) {
            this.errors.push('Email Required');
          }
          if(!this.mobile_number) {
            this.errors.push('Mobile Number Required');
          }
          if(!this.password) {
            this.errors.push('Password Required');
          }
          if(!this.confpassword) {
            this.errors.push('Password Confirmation Required');
          }
        }
        e.preventDefault();
      },


      // LOGIN
      checkLogin: function (e) {
        this.errors = [];
        if(!this.email || !this.password) {
          if(!this.email) {
            this.errors.push('Email Required');
          }
          if(!this.password) {
            this.errors.push('Password Required');
          }

        }
        else {

          let temp = this;

          var xhttp = new XMLHttpRequest();
          var formData = {email: this.email, password: this.password};

          xhttp.onreadystatechange = function() {
            if(this.readyState == 4) {
              if(this.status == 200) {
                window.location.href='/home';
              }
              else if(this.status == 401) {
                temp.errors.push('Invalid Email or Password');
              }
            }
          };

          xhttp.open("POST", "/login", true);
          xhttp.setRequestHeader("Content-type", "application/json");
          xhttp.send(JSON.stringify(formData));

        }

        e.preventDefault();

      }

    }

});