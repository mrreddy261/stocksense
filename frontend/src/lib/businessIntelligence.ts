export const businessIntelligenceMap: Record<string, any> = {
    "RELIANCE": {
        projects: [
            "Green energy giga factories",
            "Jio telecom network expansion",
            "Retail supply chain & warehousing growth"
        ],
        acquisitions: [
            "Lithium Werks battery assets",
            "Majority stake in Udhaiyams Agro Foods"
        ],
        divestments: [
            "Pune-Satara toll road project sale",
            "Exited non-core infrastructure assets"
        ],
        strategic: [
            "Disney + Reliance media merger (JioStar)",
            "Defence manufacturing partnerships"
        ]
    },
    "TCS": {
        projects: [
            "Enterprise Generative AI platform rollout",
            "Cloud transformation megadeals with European banks",
            "B2B IoT supply chain management"
        ],
        acquisitions: [
            "W12 Studios (Digital design agency)",
            "Postbank Systems AG (IT branch)"
        ],
        divestments: [
            "Consolidated non-performing BPO segments",
            "Scaled down physical data center ownership"
        ],
        strategic: [
            "Deepened NVIDIA partnership for AI infrastructure",
            "Microsoft Azure global strategic joint venture"
        ]
    },
    "HDFCBANK": {
        projects: [
            "Digital 2.0 IT framework implementation",
            "Rural India micro-finance penetration",
            "Next-gen mobile banking interface"
        ],
        acquisitions: [
            "Complete merger with parent entity HDFC Ltd",
            "Strategic stake in Go Digit Life Insurance"
        ],
        divestments: [
            "Reduced stake in CDSL",
            "Sold off non-core real estate assets post-merger"
        ],
        strategic: [
            "Co-branded credit card expansion with Marriott",
            "Data analytics partnership with global tech giants"
        ]
    },
    "INFY": {
        projects: [
            "Topaz (Generative AI capability framework)",
            "Cobalt (Cloud execution environment)",
            "Enterprise 5G automation integration"
        ],
        acquisitions: [
            "InSemi (Semiconductor design services)",
            "Danske Bank's IT center in India"
        ],
        divestments: [
            "Panaya and Skava (legacy software divisions)",
            "Exited Russian operations"
        ],
        strategic: [
            "Pact with Aramco for AI & HR tech",
            "Multi-year cloud partnership with AWS"
        ]
    },
    "SBIN": {
        projects: [
            "YONO 2.0 digital banking overhaul",
            "Green energy transition financing",
            "Advanced SME credit underwriting AI"
        ],
        acquisitions: [
            "Increased stake in SBI Pension Funds",
            "Acquisition of Yes Bank equity (Rescue plan)"
        ],
        divestments: [
            "Monetization of non-core real estate",
            "Diluted stake in SBI Life Insurance"
        ],
        strategic: [
            "Co-lending pacts with major NBFCs",
            "Strategic partnership with Flywire for global payments"
        ]
    }
};

export const defaultIntelligence = {
    projects: [
        "Ongoing domestic capacity expansion",
        "Digital transformation of core business",
        "ESG sustainability frameworks"
    ],
    acquisitions: [
        "Evaluating strategic bolt-on acquisitions",
        "Consolidation of minority stakes"
    ],
    divestments: [
        "Divesting sub-par margin business units",
        "Monetization of legacy assets"
    ],
    strategic: [
        "Joint ventures for localized manufacturing",
        "Strategic vendor partnerships"
    ]
};

export function getBusinessIntelligence(ticker: string) {
    const cleanTicker = ticker.replace('.NS', '').replace('.BO', '').toUpperCase();
    return businessIntelligenceMap[cleanTicker] || defaultIntelligence;
}
