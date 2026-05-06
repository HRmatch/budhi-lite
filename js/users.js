const PRESET_USERS = [
  { username:'beto', display_name:'Beto', password:'budhi-lite' },
  { username:'luciana', display_name:'Luciana', password:'budhi-lite' },
  { username:'laercio', display_name:'Laercio', password:'budhi-lite' },
  { username:'ana_luiza', display_name:'Ana Luiza', password:'budhi-lite' },
  { username:'idejan', display_name:'Idejan', password:'budhi-lite' },
  { username:'xarlys', display_name:'Xarlys', password:'budhi-lite' },
  { username:'thierry', display_name:'Thierry', password:'budhi-lite' },
  { username:'admin', display_name:'Admin', password:'budhi-admin', admin:true }
];
function findUser(username){return PRESET_USERS.find(u=>u.username===username)}
function publicUser(u){return {username:u.username, display_name:u.display_name, admin:!!u.admin}}
