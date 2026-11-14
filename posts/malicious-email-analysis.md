---
title: Malicious E-Mail attachment analysis
date: 2022-02-17
description: We take a look at a phishing Mail attachment
---

## Introduction

Phishing e-mails have become a go-to standard for the everyday attacker as they provide their first entry point inside an organization. They can be sent in bulk targeting everybody, from desktop users to employees of a company. When sent this way these phishing attempts are known as mass phishing attacks, but there are also more targeted ones aimed at certain individuals inside a corporation and those attacks are known as Whaling phishing attacks.

## Analysis

We often receive a lot of phishing e-mails from our clients and a lot of times these e-mails contain a lot of information about the "hacker" behind them and the techniques used by the adversaries. There are a lot of tools that can be used to analyze EML files. I Even wrote a tool using Golang and it is available on my github page: [https://github.com/6en6ar/MailPiercer](https://github.com/6en6ar/MailPiercer)

Mail Piercer is a simple tool that parses E-mail headers and can provide you with informations such as the IP address of the sender, its geolocation and mail headers related to spoofing. In this tutorial we won't be analyzing eml files but will focus more on the sent attachment in one of the e-mails that were sent to our client.

The attachment itself contained only an .htm file which when double clicked redirected the user to a malicious Office phishing page. These files are similar to .html files as they can contain hyperlinks and markup language which define the layout of the webpage and can have Javascript embedded inside

Inside the file I found a lot of obfuscated Javascript which was difficult to read at first

![Malicious JS](images/JavasriptMal.png)

We used JSbeautify to better see the code behind and were presented with yet more obfuscated JS

```
var _0xc1e = ["", "split", "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/", "slice", "indexOf", "", "", ".", "pow", "reduce", "reverse", "0"];
    function _0xe71c(d, e, f) {
        var g = _0xc1e[2][_0xc1e[1]](_0xc1e[0]);
        var h = g[_0xc1e[3]](0, e);
        var i = g[_0xc1e[3]](0, f);
        var j = d[_0xc1e[1]](_0xc1e[0])[_0xc1e[10]]()[_0xc1e[9]](function(a, b, c) {
            if (h[_0xc1e[4]](b) !== -1) return a += h[_0xc1e[4]](b) * (Math[_0xc1e[8]](e, c))
        }, 0);
        var k = _0xc1e[0];
        while (j > 0) {
            k = i[j % f] + k;
            j = (j - (j % f)) / f
        }
        return k || _0xc1e[11]
    };
    function malware(h,u,n,t,e,r) {
        r = "";
        for (var i = 0, len = h.length; i < len; i++) {
            var s = "";
            while (h[i] !== n[e]) {
                s += h[i];
                i++
            }
            for (var j = 0; j < n.length; j++) s = s.replace(new RegExp(n[j], "g"), j);
            r += String.fromCharCode(_0xe71c(s, e, 10) - t)
        }
        return decodeURIComponent(escape(r))
    };
    var ret = malware("REDACTEDSTRING", 67, "AWGnROirI", 15, 3, 4)
```

But I didn't have to break the obfuscation using some ancient technique and heavy reverse engineering because by just logging the string in ret variable without executing it and removing the eval() function which is not present in this file we can see the end result.

The obfuscated .htm / Javascript file executes JS by redirecting the user using a "META" html tag, which is a common technique both used by developers and malware authors

![Malicious JS](images/FinalJS.png)

The email address is blurred here but it takes it as input and fills the form on the phishing webpage so you just have to type in the password :)

Only one vendor on VirusTotal flagged the url as suspicious which is a bit odd

![Virustotal](images/VirusTotal.png)

Some outgoing links point to Microsoft Teams application and other Microsoft related domains which indicated that is probably used somewhere else as a phsihing page. Sadly, the url is not available anymore to confirm this

While the investigation was ongoing another domain was seen using the same IP address: darboymilo.xyz and it was found that iz was registered on October 14. 2021 which when checked on https://urlscan.io shows that it is used for the same purpose using the same url strategy as the previous: "darboymilo.xyz/ionos/?email=EMAIL"

![Urlscan](images/urlscan.png)
