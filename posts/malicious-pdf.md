---
title: Analyzing and understanding PDF Malware
date: 2022-02-19
description: How attackers use PDF to distribute malware
---

## World of Evil PDFs

In a lot of cases of malware distribution the adversaries use malicious Word documents or documents that are part of the Office suite of tools because they contain Macros that can easily execute once the victim enables them. They are written in Visual Basic which is a powerful language that can even interact with the Windows API which is the crucial part of any Windows Malware

In this section we will talk about a recent trend that some attackers have been abusing. We will look how easily one can create and distribute malware using PDF documentas which are an essential part of any business and users interact with them on regular basis.

When I started researching PDF malware there wasn't much on the internet except some Adobe PDF Reader vulnerabilities which are always present and can help attackers achiee RCE on the victim stations. That was the case until I found this awesome post which talks about embedding executables inside PDF files and later executing them using Javascript, since most of the PDF readers have the ability to execute Javascript which is crazy. [https://nora.codes/post/pdf-embedding-attacks/](https://nora.codes/post/pdf-embedding-attacks/)

I wrote some Proof of Concept code that is available on my github page and tested it against the latest Foxit PDFReader but the Javascript execution was blocked by the software. [https://github.com/6en6ar/MaliciousPDF](https://github.com/6en6ar/MaliciousPDF)

In short it basically uses SettingContent-ms XML files that are embedded inside the PDF files and can be called upon using "exportDataObject" function inside JavaScript. These XML files are special files that have a DeepLink field which can execute any command given. So just think about Powershell in-memory execution and you'll get there.. You can use a number of these XML files and embed them to make a dropper.

This is when I read in a post that some APTs distribute their phishing links inside PDF files so I added this functionality too. You can easily generate your malicious files with the above mentioned tool using Pythons fpdf and PyPDF4 libraries

This is a very common method to force users to enter their domain credentials inside phishing forms on the attacker domain Since PDF documents allow you to visit these sites by just clicking on a link.

Images can also contain links inside PDF files so the victims can be lured more easily.

Most desktop users use Google Drive and One Drive storage to keep their photos. By clicking on a photo the malicious Javascript can open a prompt inside the malicious PDF file that prompts the user for their credentials for the storage service and then collects them sending them using XMLHttpRequest, fetch from JS

Planting PDF files with DLLs or real binary files can set the stage for a bigger attack later in the cyber kill chain.

For even better understanding of these before mentioned methods of social engineering check out the above Github link.( P.S. It's not malicious )
