namespace DataFetcher;

public class ContractResult
{
    public string code { get; set; }
    public ContractResultSummary data { get; set; }
}

public class ContractResultSummary
{
    public List<ContractData> data { get; set; }
}

public class ContractData
{
    public decimal? amountPaid { get; set; }
    public decimal? budget { get; set; }
    public string  category { get; set; }
    public string completionDate { get; set; }
    public string componentCategories { get; set; }
    public string contractId { get; set; }
    public string contractor { get; set; }
    public string description { get; set; }

    public bool hasSatelliteImage { get; set; }
    
    public string infraYear { get; set; }

    public bool isLive { get; set; }
    public decimal? latitude { get; set; }
    public decimal? longitude { get; set; }

    public string programName { get; set; }
    public decimal? progress { get; set; }
    public int reportCount { get; set; }
    public string sourceOfFunds { get; set; }
    public string startDate { get; set; }
    public string status { get; set; }
}

public class ContractLocation
{
    public string province { get; set;}
    public string region { get; set;}
}