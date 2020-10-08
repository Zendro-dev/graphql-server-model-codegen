
const Express = require('express');
const Routes = require("./static_route_db");

var port = process.env.PORT || 3344;
var base_url = process.env.BASE_URL || "";

var app = Express();

app.listen(port, function () {

    console.log(`The Express server is listening on port ${port}`);

    if(base_url.length !== 0) {
        console.log(`The Base URL is \"${base_url}\"`);
    }else{
        base_url = "/";
    }

    app.use(`${base_url}`, Routes.routes());
});