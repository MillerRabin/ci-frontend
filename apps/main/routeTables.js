import Frontpage from "../Frontpage/Frontpage.js";
import ChangePassword from "../ChangePassword/ChangePassword.js";

export default [
    { name: 'frontpage', path: '/', Constructor: Frontpage, active: 0 },
    { name: 'change-password', path: '/changePassword.html', Constructor: ChangePassword }
];