import Frontpage from "../Frontpage/Frontpage.js";
import ChangePassword from "../ChangePassword/ChangePassword.js";

export default [
    { name: 'frontpage', path: '/', Constructor: Frontpage },
    { name: 'change-password', path: '/changePassword.html', Constructor: ChangePassword }
];