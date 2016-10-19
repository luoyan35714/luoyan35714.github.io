---
layout: post
title:  Modbus-学习笔记(十四) - MODBUS常用校验算法
date:   2016-09-20 11:04:00 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}


LRC(Longitudinal redundancy check)
=============================

Modbus ASCII 数据格式
-----------------------------

| 起始字节 | 数据字节 | 校验字节 | 结束字节 |
| 1        | 2n       | 2        | 2        |

算法描述
-----------------------------

数据（2n个字符）两两组成一个16进制的数值，然后将这些数值相加，将所得加值%256后取反，再加1

Example
-----------------------------

| 发送数值(字节数组) | 3A 30 31 30 33 30 30 30 30 30 30 30 41 46 32 0D 0A     |
| 发送数值(16进制)   |  :  0  1  0  3  0  0  0  0  0  0  0  A  F  2 \r \n     |
| 数值分析           | 起始字节(:),数据(01030000000A),校验(F2),结束字节(\r\n) |
| 数据值拆分         | 01030000000A -> 0x01, 0x03, 0x00, 0x00, 0x00, 0x0A     |
| 求和               | 0x01 + 0x03 + 0x00 + 0x00 + 0x00 + 0x0A = 0x0E         |
| 取模               | 0x0E % 0x100 = 0x0E & 0xFF = 0x0E                     |
| 取反               | ~0x0E = ~(0000 1110) = 1111 0001 = 0xF1                |
| 加1                | 0xF1 +1 = 0xF2 = ASCII(46 32)                          |

java代码实现
-----------------------------

{% highlight java %}
package com.freud.modbus.algorithm;

import java.util.Arrays;

/**
 * LRC(Longitudinal redundancy check)
 * 
 * @author Freud
 *
 */
public class LRCUtil {

	public static byte[] LRC(byte[] src) {
		return LRC(new String(src));
	}

	public static byte[] LRC(String src) {

		int[] request = new int[src.length() / 2];
		for (int i = 0; i < src.length() - 1; i += 2) {
			request[i / 2] = Integer.valueOf(src.substring(i, i + 2), 16);
		}

		byte ret = 0;
		for (int b : request) {
			ret += (b & 0xFF);
		}

		return new byte[] { (byte) (~ret + 1) };
	}

	public static String bytesToHexString(byte[] src) {
		if (src == null || src.length <= 0) {
			return null;
		}
		StringBuilder stringBuilder = new StringBuilder("");
		for (int i = 0; i < src.length; i++) {
			int v = src[i] & 0xFF;
			String hv = Integer.toHexString(v);
			if (hv.length() < 2) {
				stringBuilder.append(0);
			}
			stringBuilder.append(hv);
		}

		return stringBuilder.toString().toUpperCase();
	}

	public static void main(String[] args) {
		// MODBUS ASCII REQUEST
		// 3A 30 31 30 33 30 30 30 30 30 30 30 41 46 32 0D 0A
		byte[] request = new byte[] { 0x30, 0x31, 0x30, 0x33, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
				0x30, 0x41 };
		String result = bytesToHexString(LRC(request));
		System.out.println("Calculated by LRC result : [" + result + "]");
		System.out.println("Calculated by LRC result to 10 radix: ["
				+ Arrays.toString(result.getBytes()) + "]");
		System.out.println("Calculated by LRC result to 16 radix: ["
				+ bytesToHexString(result.getBytes()) + "]");
	}

}
/**
 * Calculated by LRC result : [F2]
 * Calculated by LRC result to 10 radix: [[70, 50]]
 * Calculated by LRC result to 16 radix: [4632]
 */
{% endhighlight %}

Checksum
=============================

电总协议数据格式
-----------------------------

| 序号    | 1   | 2   | 3   | 4    | 5    | 6      | 7    | 8      | 9   |
| 字节数  | 1   | 1   | 1   | 1    | 1    | 2      | X    | 2      | 1   |
| 格式    | SOI | VER | ADR | CID1 | CID2 | LENGTH | INFO | CHKSUM | EOI |

电总协议数据格式释义
-----------------------------

| 序号 | 符号   | 表示意义                                                            | 备注     |
| 1    | SOI    | 起始标志位（START OF INFORMATION）                                  | ~（7EH） |
| 2    | VER    | 通讯协议版本号                                                      |          |
| 3    | ADR    | 设备地址描述（1-254，0、255保留）                                   |          |
| 4    | CID1   | 控制标识码（UPS模块标识码为2AH）                                    |          |
| 5    | CID2   | 命令信息：控制标识码（数据活动作类型描述）,响应信息：返回码RTN      |          |
| 6    | LENGTH | INFO字节长度（包括LENID和LCHKSUM）                                  |          |
| 7    | INFO   | 命令信息：控制数据信息COMMAND INFO, 应答信息：应答数据信息DATA INFO |          |
| 8    | CHKSUM | 校验和码                                                            |          |
| 9    | EOI    | 结束码                                                              | CR（0DH）|


总和检验码算法描述
-----------------------------

CHKSUM的计算是除SOI、EOI和CHKSUM外，其他字符ASCII码值累加求和，所得结果模65535余数取反加1。

Example
-----------------------------

| 发送数值(字节数组)   | ~1203400456ABCDFEFC72\R                                                                         |
| 去掉SOI,EOI,CHESUM   | 1203400456ABCDFE                                                                                |
| 加和                 | '1'+'2'+'0'+'3'+'4'+'0'+'0'+'4'+'5'+'6'+'A'+'B'+'C'+'D'+'F'+'E'                                 |
| 十六进制ASCII        | '31H'+'32H'+'30H'+'33H'+'34H'+'30H'+'30H'+'34H'+'35H'+'36H'+'41H'+'42H'+'43H'+'44H'+'46H'+'45H' |
| 求和                 | = 038EH                                                                                         |
| 取模                 | 038EH % 65535 =  038E & 65535 = 0x038EH                                                         |
| 取反                 | ~0x038EH = ~(0000 0011 1000 1110) = 1111 1100 0111 0001 = 0xFC71H                               |
| 加1                  | 0xFC71H +1 = 0xFC72H                                                                            |

Java代码实现
-----------------------------

{% highlight java %}
package com.freud.pmb.algorithm;

/**
 * Checksum
 * 
 * @author Freud
 *
 */
public class CheckSumUtil {

	public static void main(String[] args) {
		String source = "1203400456ABCDFE";
		System.out.println(checksum(source));
	}

	public static String checksum(String chkstr) {
		int sum = 0;
		for (byte sbyte : chkstr.getBytes()) {
			sum += sbyte;
		}
		Integer intvalue = ~(sum % 65535) + 1;
		return Integer.toHexString(intvalue).substring(4).toUpperCase();
	}
}
{% endhighlight %}


<br>
<br>

参考资料
================================

Longitudinal_redundancy_check Wikipedia : [https://en.wikipedia.org/wiki/Longitudinal_redundancy_check](https://en.wikipedia.org/wiki/Longitudinal_redundancy_check)

LRC校验算法C语言程序 : [http://wenku.baidu.com/link?url=q-H18ICZWvf_krPrpHR8R6gs568dVUJRRpsmkKsadkFS54H3dHJ25d0i9o0hio4qUR87DHtAfrlPFPr9VG_PblV93cMDYFV1zuDprgsjPci](http://wenku.baidu.com/link?url=q-H18ICZWvf_krPrpHR8R6gs568dVUJRRpsmkKsadkFS54H3dHJ25d0i9o0hio4qUR87DHtAfrlPFPr9VG_PblV93cMDYFV1zuDprgsjPci)

Modbus wikipedia : [https://en.wikipedia.org/wiki/Modbus#Frame_format](https://en.wikipedia.org/wiki/Modbus#Frame_format)

modbus tools : [http://www.modbustools.com/modbus.html#lrc](http://www.modbustools.com/modbus.html#lrc)

艾默生 M810G电总协议V120 : [http://wenku.baidu.com/link?url=nJDObiCy2wrk3ePZ8rssp1YSMNnytEG8ExmePgZQJEkeIwh6bQV53z59ZOxgt1HZmE13ko3Nh0jRgkpImOzJtzOkyXaNhlkCm9Tkeb494Gm](http://wenku.baidu.com/link?url=nJDObiCy2wrk3ePZ8rssp1YSMNnytEG8ExmePgZQJEkeIwh6bQV53z59ZOxgt1HZmE13ko3Nh0jRgkpImOzJtzOkyXaNhlkCm9Tkeb494Gm)
