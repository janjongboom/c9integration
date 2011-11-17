# Cloud 9 integration tests

Hi folks, this consists of a couple of things. First there are two integration tests here, one for Github and one for Bitbucket.
These are end to end integration tests of all the flow C9 -> Authentication -> Callback.

Furthermore there is a query class to query the forever data on c9infra. This is in the cloud9infra branch under /status URL.

There are basically two applications. Run `node server.js` to gather data, we can make this a cronjob that runs every 10 secs or so. 
Maybe less. Then you can run `node static-fileserver.js` for the UI. The data is stored in `./public/datasource.json`.