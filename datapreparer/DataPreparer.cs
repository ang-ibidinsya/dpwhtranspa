using System.Text.Json;
using System.Text.RegularExpressions;
using System.IO.Compression;

namespace DataPreparer;

public class DataManager
{
    /// <summary>
    /// Directory of per-page raw contract from DPWH Transpa Website
    /// </summary>
    public string DirPath { get; set; }

    private MasterData _masterData { get; set; } = new MasterData();
    Dictionary<string, ushort> _masterCategories;
    Dictionary<string, ushort> _masterCompCat;
    Dictionary<string, ushort> _masterStatus;
    Dictionary<string, ushort> _masterProgramme;
    Dictionary<string, ushort> _masterSrcOfFunds;
    Dictionary<string, ushort> _masterProvince;
    Dictionary<string, ushort> _masterRegion;
    Dictionary<string, uint> _masterContractor;

    /// <summary>
    /// Ctor that accepts path of raw contract json files.
    /// The directory contains 1 json file for each page getched via HTTP from DPWH Transpa Website.
    /// </summary>
    /// <param name="pathDir"></param>
    public DataManager(string pathDir)
    {
        DirPath = pathDir;
    }

    /// <summary>
    /// Constructor that takes in all parsed contracts json along with its master data.
    /// This is in preparation for re-cateogrizing the DPWH contracts using own algo.
    /// </summary>
    /// <param name="pathDir"></param>    

    public IEnumerable<string> ReadData()
    {
        if (!Directory.Exists(DirPath))
        {
            throw new Exception($"Path does not exist: {Path.Combine(Environment.CurrentDirectory, DirPath)}");
        }

        string[] files = Directory.GetFiles(DirPath);
        foreach(string file in files)
        {
            Console.WriteLine($"[ReadData] Processing contract: {file}");
            yield return File.ReadAllText(file);
        }
        
    }

    private static ushort? FindIdx(Dictionary<string, ushort> dict, string key)
    {
        if (string.IsNullOrEmpty(key))
        {
            return null;
        }

        if (!dict.ContainsKey(key))
        {
            dict.Add(key, (ushort)dict.Count);            
        }
        return dict[key];
    }

    private static uint? FindIdxUint(Dictionary<string, uint> dict, string key)
    {
        if (string.IsNullOrEmpty(key))
        {
            return null;
        }

        if (!dict.ContainsKey(key))
        {
            dict.Add(key, (ushort)dict.Count);            
        }
        return dict[key];
    }

    private void ClearMasterData()
    {
        _masterCategories = [];
        _masterCompCat = [];
        _masterContractor = [];
        _masterProgramme = [];
        _masterProvince = [];
        _masterRegion = [];
        _masterSrcOfFunds = [];
        _masterStatus = [];        
    }

    // For the DPWH Transparency website, some contractors do not have a contractor ID:
    // E.g. ULTICON BUILDERS, INC. (17267) / SHIMIZU CORPORATION / TAKENAKA CIVIL ENGINEERING & CONSTRUCTION CO., LTD.
    // FAJR CONSTRUCTION PARTS AND SUPPLY (40114) / MATT GLASS/ ALUMINUM/ CONSTRUCTION SUPPLY AND ALLIED SERVICES (37092)
    private static string[] ProcessContractorsNg(string contractorStr)
    {
        if (string.IsNullOrEmpty(contractorStr))
        {
            return []; // Most likely contract is still bidding
        }
        string pattern = @"\s*/\s*(?=[^/]*\(\d+\))"; // Assumes there is a parenthesis (contractorID) for each contractor --> not true anymore
        try
        {
            return Regex.Split(contractorStr, pattern);
        }
        catch(Exception ex)
        {
            Console.WriteLine($"[ProcessContractors] Exception parsing contractor string: {ex}");
            throw;
        }        
    }
    private static string[] ProcessContractors(string contractorStr)
    {
        if (string.IsNullOrEmpty(contractorStr))
        {
            return []; // Most likely contract is still bidding
        }
        string delimiter = @" / ";
        try
        {
            return contractorStr.Split(delimiter);
        }
        catch(Exception ex)
        {
            Console.WriteLine($"[ProcessContractors] Exception parsing contractor string: {ex}");
            throw;
        }        
    }

    public void PrepareData()
    {
        ClearMasterData();
        List<CompactContract> compactContracts = [];
        ArrContractFile arrContractFile = new()
        {
            Fields= ["contractId", "description", "category", "status", "budget", "progress", 
                "province", "region", "contractors", "startDate", "completionDate", "infraYear",
                "programName", "sourceOfFunds", "reportCount"],
            Records = new()
        };

        IEnumerable<string> contractFiles = ReadData();
        foreach (string contractFileStr in contractFiles)
        {
            try
            {
                OrigContractFile contractFileObj = JsonSerializer.Deserialize<OrigContractFile>(contractFileStr);
                List<OrigContractRecord> origContracts = contractFileObj.data.data;

                foreach (OrigContractRecord origContract in origContracts)
                {
                    if (origContract.category != origContract.componentCategories)
                    {
                        //Console.WriteLine($"[{origContract.contractId}] Unexpected value; you may need to consider both fields, cat: {origContract.category} vs compcat: {origContract.componentCategories}");

                    }
                    ushort? catIdx = FindIdx(_masterCategories, origContract.category);
                    ushort? compCatIdx = FindIdx(_masterCompCat, origContract.componentCategories);
                    ushort? programmeIdx = FindIdx(_masterProgramme, origContract.programName);
                    ushort? provinceIdx = FindIdx(_masterProvince, origContract.location.province);
                    ushort? regionIdx = FindIdx(_masterRegion, origContract.location.region);
                    ushort? srcFundsIdx = FindIdx(_masterSrcOfFunds, origContract.sourceOfFunds);
                    ushort? statusIdx = FindIdx(_masterStatus, origContract.status);

                    // [a] Compact JSON
                    CompactContract currCompact = new()
                    {
                        CategoryId = catIdx,
                        ContractId = origContract.contractId,
                        Cost = origContract.budget,
                        Desc = origContract.description,
                        DistrictOfficeId = provinceIdx,
                        EndDate = origContract.completionDate,
                        StartDate = origContract.startDate,
                        Percent = origContract.progress,
                        RegionId = regionIdx,
                        SourceOfFundsId = srcFundsIdx,
                        StatusId = statusIdx,
                        Year = Convert.ToUInt16(origContract.infraYear),
                        ReportCount = origContract.reportCount
                    };

                    // Process Contractors
                    string[] contractors = ProcessContractors(origContract.contractor);
                    List<ushort> contractordIdxList = [];
                    foreach (string contractor in contractors)
                    {
                        var contractorId = FindIdxUint(_masterContractor, contractor);
                        if (contractorId.HasValue)
                        {
                            currCompact.ContractorIds.Add(contractorId.Value);
                        }
                    }
                    compactContracts.Add(currCompact);

#if false // Experiment with Array JSON
                    // [b] Array JSON
                    List<object> recordsArr = new()
                    {
                        origContract.contractId,
                        origContract.description,
                        catIdx,
                        statusIdx,
                        origContract.budget,
                        origContract.progress,
                        origContract.location.province,
                        origContract.location.region,
                        string.Join(",", currCompact.ContractorIds),
                        Utils.GetDateValue(origContract.startDate),
                        Utils.GetDateValue(origContract.completionDate),
                        currCompact.Year,
                        programmeIdx,
                        srcFundsIdx,
                        origContract.reportCount
                    };

                    arrContractFile.Records.Add(recordsArr);
#endif
                } // end foreach contract
            } // end try
            catch (Exception ex)
            {
                Console.WriteLine($"Exception deserializing contract file: {ex}");
                throw;
            }
            // break;
        }

        // Write to file
        var compactContractsSorted = compactContracts.OrderByDescending(x => x.Cost);
        string compactJson = JsonSerializer.Serialize(compactContractsSorted);        
        File.WriteAllText("compactJson.json", compactJson);
        //string arrayJson = JsonSerializer.Serialize(arrContractFile);
        //File.WriteAllText("arrayJson.json", arrayJson);
        using (var fileStream = File.Create("compactJson.gz"))
        using (var gzipStream = new GZipStream(fileStream, CompressionMode.Compress))
        using (var writer = new StreamWriter(gzipStream))
        {
            writer.Write(compactJson);
        }

        PrepareMasterData();
        string masterDataJson = JsonSerializer.Serialize(_masterData);
        File.WriteAllText("masterData.json", masterDataJson);
        using (var fileStream = File.Create("masterData.gz"))
        using (var gzipStream = new GZipStream(fileStream, CompressionMode.Compress))
        using (var writer = new StreamWriter(gzipStream))
        {
            writer.Write(masterDataJson);
        }

        Console.WriteLine($"[PrepareData()] Processed {compactContracts.Count} contract. Finished writing to compactJson.json");

    }

    private void PrepareMasterData()
    {
        _masterData.CategoryMaster = _masterCategories.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);
        _masterData.ContractorMaster = _masterContractor.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);
        _masterData.ProvinceMaster = _masterProvince.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);
        _masterData.RegionMaster = _masterRegion.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);
        _masterData.SourceMaster = _masterSrcOfFunds.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);
        _masterData.StatusMaster = _masterStatus.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);
        _masterData.ProgrammeMaster = _masterProgramme.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);
    }
}