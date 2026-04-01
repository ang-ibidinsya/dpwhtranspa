using DataFetcher;
using System;
using System.Text;

Console.OutputEncoding = Encoding.UTF8;

Logger.Green("Start Fetch Data from DPWH Transparency Server...");
DpwhDataFetcher dataFetcher = new();
await dataFetcher.FetchData();
Logger.Green("Finished!");
