using Nexora.Api.Dtos.Responses;

public class PortfolioDesignSpecTests
{
    [Fact]
    public void DefaultDesign_UsesCurrentVersionAndIsValid()
    {
        var spec = PortfolioDesignSpecDto.CreateDefault();

        Assert.Equal(2, spec.Version);
        Assert.Contains("field-notes", PortfolioDesignSpecDto.Directions);
        Assert.Contains("gallery-led", PortfolioDesignSpecDto.Directions);
        Assert.Contains("gallery", PortfolioDesignSpecDto.MediaLayouts);
        Assert.True(spec.IsValid());
    }

    [Fact]
    public void DesignValidation_RejectsUnknownMediaLayoutAndDirection()
    {
        var spec = PortfolioDesignSpecDto.CreateDefault();
        spec.MediaLayout = "arbitrary-css";
        Assert.False(spec.IsValid());

        spec = PortfolioDesignSpecDto.CreateDefault();
        spec.Direction = "model-generated-html";
        Assert.False(spec.IsValid());
    }
}
