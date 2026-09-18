namespace Nexora.Api.Enums;

public enum ThematicArea
{
    TecnologiaInovacao = 1,
    NegociosGestao = 2,
    EngenhariaIndustria = 3,
    SaudeBiotecnologia = 4,
    HumanidadesSociedadeDireito = 5,
    ArtesDesignComunicacao = 6
}

public static class ThematicAreaExtensions
{
    public static string ToDisplayName(this ThematicArea area) => area switch
    {
        ThematicArea.TecnologiaInovacao => "Tecnologia e Inovação",
        ThematicArea.NegociosGestao => "Negócios e Gestão",
        ThematicArea.EngenhariaIndustria => "Engenharia e Indústria",
        ThematicArea.SaudeBiotecnologia => "Saúde e Biotecnologia",
        ThematicArea.HumanidadesSociedadeDireito => "Humanidades, Sociedade e Direito",
        ThematicArea.ArtesDesignComunicacao => "Artes, Design e Comunicação",
        _ => area.ToString()
    };
}
