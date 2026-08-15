using System.Text.Json.Serialization;
using DataPreparer;

#region Orig JSON from DPWH website
public class OrigContractFile
{
    public int status { get; set; }
    public string code { get; set; }

    public OrigFileData data { get; set; }
}

public class OrigFileData
{
    public List<OrigContractRecord> data { get; set; }
}

public class OrigContractRecord
{
    public string contractId { get; set; }
    public string description { get; set; }
    public string category { get; set; }
    public string componentCategories { get; set; }
    public string status { get; set; }
    public decimal budget { get; set; }
    public decimal? amountPaid { get; set; }
    public decimal? progress { get; set; }
    public OrigLocation location { get; set; }
    public string contractor { get; set; }
    public DateTime? startDate { get; set; }
    public DateTime? completionDate { get; set; }
    public string infraYear { get; set; }
    public string programName { get; set; }
    public string sourceOfFunds { get; set; }
    public bool? isLive { get; set; }
    public string livestreamUrl { get; set; }
    public string livestreamVideoId { get; set; }
    public string livestreamDetectedAt { get; set; }
    public decimal? latitude { get; set; }
    public decimal? longitude { get; set; }
    public int? reportCount { get; set; }
    public bool? hasSatelliteImage { get; set; }
}

public class OrigLocation
{
    public string province { get; set; }
    public string region { get; set; }
}
#endregion 

#region Compact Data for serving to webapp
public class CompactContract
{
    [JsonPropertyName("id")]
    public string ContractId { get; set; }
    [JsonPropertyName("ds")]
    public string Desc { get; set; }
    [JsonPropertyName("ci")]
    public List<uint> ContractorIds { get; set; } = new List<uint>();
    public List<string> Contractors = new List<string>();
    [JsonPropertyName("dt")]
    public ushort? DistrictOfficeId { get; set; }
    public string DistrictOffice;
    [JsonPropertyName("sf")]
    public ushort? SourceOfFundsId { get; set; }
    public string SourceOfFunds;

    [JsonPropertyName("p")] // pesos
    public decimal Cost { get; set; }
    [JsonPropertyName("fr")]
    //public string StartDateStr { get { return StartDate.HasValue ? StartDate.Value.ToString("yy-MM-dd") : string.Empty; }}
    public int? StartDateN { get { return Utils.GetDateValue(StartDate); } }
    public DateTime? StartDate;
    [JsonPropertyName("to")]
    //public string EndDateStr { get { return EndDate.HasValue ? EndDate.Value.ToString("yy-MM-dd") : string.Empty; }}
    public int? EndDateN { get { return Utils.GetDateValue(EndDate); } }
    public DateTime? EndDate;
    [JsonPropertyName("s")]
    public ushort? StatusId { get; set; }
    public string Status;
    [JsonPropertyName("pc")]
    public decimal? Percent { get; set; }
    [JsonPropertyName("y")]
    public ushort Year { get; set; }
    [JsonPropertyName("r")]
    public ushort? RegionId { get; set; }
    public string Region;

    [JsonIgnore]
    public List<string> Tags { get; set; } = new List<string>();

    [JsonPropertyName("cg")]
    public ushort? CategoryId { get; set; }
    [JsonPropertyName("mc")]
    public ushort? MyCategoryId { get; set; }

    [JsonPropertyName("rp")]
    public int? ReportCount { get; set; }
}
#endregion

#region Array Data for serving to webapp
public class ArrContractFile
{
    public List<string> Fields { get; set; }
    public List<List<object>> Records { get; set; }
    public List<string> MasterStatus { get; set; }
    public List<string> MasterCategory { get; set; }
    public List<string> MasterProvince { get; set; }
    public List<string> MasterRegion { get; set; }
    public List<string> MasterContractor { get; set; }
    public List<string> MasterSourceOfFunds { get; set; }
    public List<string> MasterProgramme { get; set; }
}
#endregion