return await Deployment.RunAsync(() =>
{
    // Add your resources here
    // e.g. var resource = new Resource("name", new ResourceArgs { });

    // Export outputs here
    var bucket = new Cf.R2Bucket("myBucket", new Cf.R2BucketArgs());
});
