
namespace DataFetcher;

public class DpwhDataFetcher
{
    async public Task FetchData()
    {
        // [0] Prepare Http Client
        HttpFactory.ConfigureClient(client =>
        {
            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36");
            client.DefaultRequestHeaders.Add("accept", "*/*");
            //client.DefaultRequestHeaders.Add("accept-encoding", "gzip, deflate, br, zstd");
            client.DefaultRequestHeaders.Add("accept-language", "en-US,en;q=0.7");
            client.DefaultRequestHeaders.Add("cache-control", "no-cache");
            client.DefaultRequestHeaders.Add("origin", "https://transparency.dpwh.gov.ph");
            client.DefaultRequestHeaders.Add("pragma", "no-cache");
            client.DefaultRequestHeaders.Add("priority", "u=1, i");
            client.DefaultRequestHeaders.Add("sec-ch-ua", "\"Brave\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"");
            client.DefaultRequestHeaders.Add("sec-ch-ua-mobile", "?0");
            client.DefaultRequestHeaders.Add("sec-ch-ua-platform", "Linux");
            client.DefaultRequestHeaders.Add("sec-fetch-dest", "empty");
            client.DefaultRequestHeaders.Add("sec-fetch-mode", "cors");
            client.DefaultRequestHeaders.Add("sec-fetch-site", "same-site");
            client.DefaultRequestHeaders.Add("sec-gpc", "1");
        });

        // [1] Check how many pages are there in total from /stats
        string statsUrl = "https://api.transparency.dpwh.gov.ph/ai/stats";
        Stats stats = await HttpFactory.FetchAsync<Stats>(statsUrl);
        Logger.Log($"[Stats] Total Projects: {stats.data.totalProjects}");

        // [2] 
        double pageSize = 5000.0;
        int numPages = (int)Math.Ceiling(stats.data.totalProjects / pageSize);
        // try fetch page 1
        string dataUrl = "https://api.transparency.dpwh.gov.ph/projects?page={0}&limit={1}";
        string folderName = $"Results_{DateTime.Now:yyyy-MM-dd}";
        if (!Path.Exists(folderName))
        {
            Directory.CreateDirectory(folderName);
        }
        for (int iPage = 0; iPage < numPages; iPage++)
        {
            Logger.Log($"Fetching page {iPage} / {numPages}");
            string formattedUrl = string.Format(dataUrl, iPage+1, pageSize);
            //ContractResult contract = await HttpFactory.FetchAsync<ContractResult>(formattedUrl);
            string contract = await HttpFactory.FetchAsString(formattedUrl);
            //Logger.Log($"[Contract] Contract count: {contract.data.data.Count()}");
            string fileName = $"{folderName}/Contract_{iPage}.json";
            File.WriteAllText(fileName, contract);
        }
    }
}