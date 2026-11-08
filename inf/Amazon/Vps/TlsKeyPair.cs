namespace Inf.Amazon.Vps;

internal sealed class TlsKeyPair : ComponentResource
{

    public Output<string> PublicKeyValue { get; }
    public Output<string> PrivateKeyValue { get; }

    public TlsKeyPair(string name, ComponentResourceOptions? options = null)
        : base("connor-bray:infrastructure:aws:vps:TlsKeyPair", name, options)
    {
        var key = new Tls.PrivateKey(name, new()
        {
            Algorithm = "ED25519"
        }, new CustomResourceOptions
        {
            Parent = this
        });

        PublicKeyValue = key.PublicKeyOpenssh;
        PrivateKeyValue = Output.CreateSecret(key.PrivateKeyOpenssh);

        RegisterOutputs(new Dictionary<string, object?>
        {
            { "privateKey", PrivateKeyValue },
            { "publicKey", PublicKeyValue }
        });
    }

}
