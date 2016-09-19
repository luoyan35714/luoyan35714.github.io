---
layout: post
title:  Modbus-学习笔记(十二)-0x10 Write Multiple registers(写多保持寄存器 )
date:   2016-06-20 23:46:30 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}


模拟器Server设置
=============================

Connection -> Connect
-----------------------------

![connect-setup](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/06-modbus-slave-connect-setup.png)

Setup -> Slave Definition
-----------------------------

![setup-definition](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/07-modbus-slave-setup-definition.png)

Display -> Signed
-----------------------------

![Display-Signed](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/08-modbus-slave-data-type-setup.png)


代码实现
=============================

Test0X10.java
-----------------------------

{% highlight java %}
package com.freud;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

/**
 * 
 * @author Freud Kang
 *
 */
public class Test0X10 {

	public static void main(String[] args) throws Exception {

		Socket socket = null;

		OutputStream os = null;
		InputStream is = null;

		try {
			socket = new Socket("localhost", 502);
			os = socket.getOutputStream();
			is = socket.getInputStream();
			String request = "00010000000F011000000004080000000A0014001E";
			System.out.println("Request  : " + request);
			os.write(hexStrToBytes(request));
			Thread.sleep(100);
			byte[] buffer = new byte[is.available()];
			is.read(buffer);
			String result = bytes2HexString(buffer);
			System.out.println("response : " + result);
		} finally {
			if (is != null) {
				is.close();
			}
			if (os != null) {
				os.flush();
				os.close();
			}
			if (socket != null) {
				socket.close();
			}
		}
	}

	public static byte[] hexStrToBytes(String hexStr) {
		if (hexStr.length() % 2 != 0) {
			throw new IllegalArgumentException("十六进制的字符串长度必须是2的倍数!");
		}
		byte[] ret = new byte[hexStr.length() / 2];
		for (int i = 0; i < hexStr.length(); i = i + 2) {
			ret[i / 2] = (byte) Integer.parseInt(hexStr.substring(i, i + 2), 16);
		}
		return ret;
	}

	public static String bytes2HexString(byte[] src) {
		StringBuilder stringBuilder = new StringBuilder();
		if (src == null || src.length <= 0) {
			return null;
		}
		for (int i = 0; i < src.length; i++) {
			int v = src[i] & 0xFF;
			String hv = Integer.toHexString(v).toUpperCase();
			if (hv.length() < 2) {
				stringBuilder.append(0);
			}
			stringBuilder.append(hv);
		}
		return stringBuilder.toString();
	}
}

/**
 * Request  : 00010000000F011000000004080000000A0014001E
 * response : 000100000006011000000004
 */
{% endhighlight %}

Request解析
-----------------------------

发送字节数组解析为16进制为`00010000000F011000000004080000000A0014001E`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 开始地址(2) | 寄存器个数(2) | 字节个数(1) | 输出值(8)               |
| 0001        | 0000        | 000F    | 01          | 10        | 0000        | 0004          | 08          | 00 00 00 0A 00 14 00 1E |

其中输出值`0000000A0014001E`转换为十进制为`0 10 20 30`

| 1 | 2  | 3  | 4  |
| 0 | 10 | 20 | 30 |

Response解析
-----------------------------

返回字节数组解析为16进制为`000100000006011000000004`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 开始地址(2) | 寄存器个数(2) |
| 0001        | 0000        | 0006    | 01          | 10        | 0000        | 0004          |


模拟器Server控制结果
=============================

![Request](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/09-modbus-slave-control-result.png)


官方文档
=============================

Request
-----------------------------

![Request](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/01_Request.png)

> *N = Quantity of Registers

Response
-----------------------------

![Response](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/02_Response.png)

Error
-----------------------------

![Error](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/03_Error.png)

Example
-----------------------------

![Example](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/04_Example_1.png)
![Example](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/04_Example_2.png)

State Diagram
-----------------------------

![State Diagram](/images/blog/modbus/modbus-05-16-Write-Multiple-registers/05_State_Diagram.png)


<br>
<br>

参考资料
================================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》

Modbus RTU和ASCII 协议解析 : [http://www.modbustools.com/modbus.html](http://www.modbustools.com/modbus.html)
