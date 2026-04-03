import {config as conf} from 'dotenv';

conf();
const _config = Object.freeze({
    port : process.env.PORT || 3000,

});


export default _config;