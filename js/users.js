const PRESET_USERS = [
  { username:'beto', display_name:'Beto', password:'checkmatch-lite' },
  { username:'luciana', display_name:'Luciana', password:'checkmatch-lite' },
  { username:'laercio', display_name:'Laercio', password:'checkmatch-lite' },
  { username:'ana_luiza', display_name:'Ana Luiza', password:'checkmatch-lite' },
  { username:'idejan', display_name:'Idejan', password:'checkmatch-lite' },
  { username:'xarlys', display_name:'Xarlys', password:'checkmatch-lite' },
  { username:'thierry', display_name:'Thierry', password:'checkmatch-lite' },
  { username:'admin', display_name:'Admin', password:'checkmatch-admin', admin:true }
];
function findUser(username){return PRESET_USERS.find(u=>u.username===username)}
function publicUser(u){return {username:u.username, display_name:u.display_name, admin:!!u.admin}}
