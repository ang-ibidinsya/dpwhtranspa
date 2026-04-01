public class MasterData
{
    public Dictionary<string, ushort> RegionMap = new Dictionary<string, ushort>();

    // For Serializing
    public Dictionary<ushort, string> RegionMaster { get; set; } = new Dictionary<ushort, string>();

    public Dictionary<ushort, string> ProvinceMaster { get; set; } = new Dictionary<ushort, string>();

    public Dictionary<ushort, string> StatusMaster { get; set; } = new Dictionary<ushort, string>();

    public Dictionary<ushort, string> ContractorMaster { get; set; } = new Dictionary<ushort, string>();

    public Dictionary<ushort, string> SourceMaster { get; set; } = new Dictionary<ushort, string>();

    public Dictionary<ushort, string> CategoryMaster { get; set; }
    public Dictionary<ushort, string> ProgrammeMaster { get; set; }
}