// 產生 SideStore 來源清單（source.json），由 GitHub Actions 呼叫。
// SideStore 會定期讀這個檔案，發現 version 變大就提示更新。
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
const site = `https://${owner}.github.io/${repo}`;
const { VERSION, BUILD, SIZE } = process.env;

const source = {
  name: '課堂薪水',
  identifier: `io.github.${owner}.classpay.source`,
  sourceURL: `${site}/source.json`,
  apps: [
    {
      name: '課堂薪水',
      bundleIdentifier: `io.github.${owner}.classpay`,
      developerName: owner,
      localizedDescription: '選內容、雙方各自評難易度，算出這堂課或這個案子的金額。',
      iconURL: `${site}/icon.png`,
      tintColor: '#1F7A55',
      versions: [
        {
          version: VERSION,
          buildVersion: BUILD,
          date: new Date().toISOString(),
          downloadURL: `https://github.com/${owner}/${repo}/releases/download/v${VERSION}/ClassPay.ipa`,
          size: Number(SIZE),
          minOSVersion: '15.0'
        }
      ],
      appPermissions: { entitlements: [], privacy: {} }
    }
  ],
  news: []
};

process.stdout.write(JSON.stringify(source, null, 2) + '\n');
