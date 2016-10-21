---
layout: post
title:  常用RAID(Redundant Array of Independent Disks)技术总结
date:   2016-10-21 11:19:00 +0800
categories: document
tag: 硬盘
---

* content
{:toc}

常用RAID简介
====================================

+ <strong>RAID 0</strong> : RAID 0 并不是真正的RAID结构，没有数据冗余，没有数据校验的磁盘陈列。实现RAID 0至少需要两块以上的硬盘，它将两块以上的硬盘合并成一块，数据连续地分割在每块盘上。 因为带宽加倍，所以读/写速度加倍， 但RAID 0在提高性能的同时，并没有提供数据保护功能，只要任何一块硬盘损坏就会丢失所有数据。因此RAID 0 不可应用于需要数据高可用性的关键领域。

+ <strong>RAID 1</strong> : RAID 1通过磁盘数据镜像实现数据冗余，在成对的独立磁盘上产生互 为备份的数据。当原始数据繁忙时，可直接从镜像拷贝中读取数据，因此RAID 1可以提高读取性能。RAID 1是磁盘阵列中单位成本最高的，但提供了很高的数据安全性和可用性。当一个磁盘失效时，系统可以自动切换到镜像磁盘上读写，而不需要重组失效的数据。RAID1是将一个两块硬盘所构成RAID磁盘阵列，其容量仅等于一块硬盘的容量，因为另一块只是当作数据“镜像”。RAID 1磁盘阵列显然是最可靠的一种阵列，因为它总是保持一份完整的数据备份。它的性能自然没有RAID 0磁盘阵列那样好，但其数据读取确实较单一硬盘来的快，因为数据会从两块硬盘中较快的一块中读出。RAID 1磁盘阵列的写入速度通常较慢，因为数据得分别写入两块硬盘中并做比较。RAID 1磁盘阵列一般支持“热交换”，就是说阵列中硬盘的移除或替换可以在系统运行时进行，无须中断退出系统。RAID 1磁盘阵列是十分安全的，不过也是较贵一种RAID磁盘阵列解决方案，因为两块硬盘仅能提供一块硬盘的容量。RAID 1磁盘阵列主要用在数据安全性很高，而且要求能够快速恢复被破坏的数据的场合。

+ <strong>RAID 10</strong> : RAID 1+0 也被称为RAID 10标准，实际是将RAID 0和RAID 1标准结合的产物，在连续地以位或字节为单位分割数据并且并行读/写多个磁盘的同时，为每一块磁盘作磁盘镜像进行冗余。它的优点是同时拥有RAID 0的超凡速度和RAID 1的数据高可靠性，但是CPU占用率同样也更高，而且磁盘的利用率比较低。由于利用了RAID 0极高的读写效率和RAID 1较高的数据保护、恢复能力，使RAID 10成为了一种性价比较高的等级，目前几乎所有的RAID控制卡都支持这一等级。但是，RAID 10对存储容量的利用率和RAID 1一样低，只有50%。因此，RAID10即高可靠性与高效磁盘结构它是一个带区结构加一个镜象结构，可以达到既高效又高速的目的，RAID 10能提供比RAID 5更好的性能。这种新结构的可扩充性不好，这种解决方案被广泛应用，使用此方案比较昂贵。

+ <strong>RAID 5</strong> : RAID 5 是一种存储性能、数据安全和存储成本兼顾的存储解决方案。 RAID 5可以理解为是RAID 0和RAID 1的折中方案。RAID 5可以为系统提供数据安全保障，但保障程度要比Mirror低而磁盘空间利用率要比Mirror高。RAID 5具有和RAID 0相近似的数据读取速度，只是多了一个奇偶校验信息，写入数据的速度比对单个磁盘进行写入操作稍慢。同时由于多个数据对应一个奇偶校验信息，RAID 5的磁盘空间利用率要比RAID 1高，存储成本相对较低，是目前运用较多的一种解决方案。RAID5数据以块为单位分布到各个硬盘上。RAID 5不对数据进行备份，而是把数据和与其相对应的奇偶校验信息存储到组成RAID5的各个磁盘上，并且奇偶校验信息和相对应的数据分别存储于不同的磁盘上。当RAID5的一个磁盘数据损坏后，利用剩下的数据和相应的奇偶校验信息去恢复被损坏的数据。

+ <strong>RAID 6</strong> : RAID6技术是在RAID 5基础上，为了进一步加强数据保护而设计的一种RAID方式，实际上是一种扩展RAID 5等级。与RAID 5的不同之处于除了每个硬盘上都有同级数据XOR校验区外，还有一个针对每个数据块的XOR校验区。当然，当前盘数据块的校验数据不可能存在当前盘而是交错存储的，这样一来，等于每个数据块有了两个校验保护屏障（一个分层校验，一个是总体校验），因此RAID 6的数据冗余性能相当好。但是，由于增加了一个校验，所以写入的效率较RAID 5还差，而且控制系统的设计也更为复杂，第二块的校验区也减少了有效存储空间。RAID-6和RAID-5一样对逻辑盘进行条带化然后存储数据和校验位，只是对每一位数据又增加了一位校验位。这样在使用RAID-6时会有两块硬盘用来存储校验位，增强了容错功能，同时必然会减少硬盘的实际使用容量。以前的raid级别一般只允许一块硬盘坏掉，而RAID-6可以允许坏掉两块硬盘，因此，RAID-6 要求至少4块硬盘。


常用RAID图示
====================================

![RAID常用技术总结图示](/images/blog/blobs/common-raid-methods/raid-examples.png)


常用RAID比较结论
====================================

 | RAID类型 | 访问速度 | 数据可靠性  | 磁盘利用率 |
 | RAID 0   | 很快     | 很低        | 100%       |
 | RAID 1   | 很慢     | 很高        | 50%        |
 | RAID 10  | 中等     | 很高        | 50%        |
 | RAID 5   | 较快     | 较高        | (n-1)/n    |
 | RAID 6   | 较快     | 较(RAID5)高 | (n-2)/n    |


参考资料
====================================

百度百科 - RAID 0 : [百度百科 - RAID 0](http://baike.baidu.com/link?url=s9cMeC2L1wlV6O7XqD2R59prk1GB_BG8tTfFlTTt4WNPH4-hvNRpe03ta6i4-JDollxxEFL3B91Wxm33VFtu6wzBN24yHrfbbTPafsv4U0i)

百度百科 - RAID 1 : [百度百科 - RAID 1](http://baike.baidu.com/link?url=wrTsDixVdsUcoZ-_c8pR7ZXjzRxWfAuFHCbyBR3BVpb3IgYHf0n4uZyBHGJlaUv635A1pThOJ4IjShjzELENs2pgXC0uOHz-dNhd6OIqP0S)

百度百科 - RAID 10 : [百度百科 - RAID 10](http://baike.baidu.com/link?url=31lRHmYyJBer_oH-nnRGtQDlV1Ck35FwtjGBjPz7frykMsdSHKGEX0HKI3fN45Xaou3xiOVdYw1VDJbqnhtL76mvATHJDrvZF5GE9IQAkGu)

百度百科 - RAID 5 : [百度百科 - RAID 5](http://baike.baidu.com/link?url=sb0o7NeS5HIOBtpkoheclDMWEm49lqtqV4PRUHVfTifne-M7XLSAoaB019tV3cmMV8P6KZ049p4L3YLVYnhKst67pEiSMfMecWYn1foexAS)

百度百科 - RAID 6 : [百度百科 - RAID 6](http://baike.baidu.com/link?url=TmLVb1k4neyOr9We1AVjvrY2qGnw-d2lqklEVi2IYbI72ZFiPGDfVF8VrmrQFcR6Giah1y1DVTshBd6j6mCAcKSibC3C8_Aa4VKPfWGMGjG)

Spark架构设计与应用 - 李智慧