---
layout: post
title:  fastdb-学习笔记(十)-交互SQL
date:   2014-12-24 13:18:01 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


The interactive SUBSQL utility allows to browse any FastDB database and to perform some administration functions with it. Also import/export of data from the database can be done by SUBSQL utility. The name SUBSQL was chosen to express that only a subset of SQL is implemented by this utility.

The following rules in BNF-like notation specifies the grammar of the SUBSQL directives:

{% highlight c %}
directive ::= 
    select (*) from table-name select-condition ;
  | insert into table-name values values-list ;
  | create index on on table-name.field-name ;
  | create table table-name (field-descriptor {, field-descriptor}) ;
  | alter table table-name (field-descriptor {, field-descriptor}) ;
  | update table-name set field-name = expression {, field-name = expression} where condition ;
  | drop index table-name.field-name ;
  | drop table table-name
  | open database-name ( database-file-name ) ;
  | delete from table-name
  | backup file-name
  | start server server-URL number-of-threads
  | stop server server-URL
  | start http server server-URL 
  | stop http server server-URL
  | export xml-file-name
  | import xml-file-name
  | commit
  | rollback
  | autocommit (on | off)
  | exit
  | show
  | help
{% endhighlight %}

{% highlight c %}
table-name ::= identifier
values-list ::= tuple { , tuple }
tuple ::= ( value { , value } )
value ::= number | string | true | false 
               | tuple
index ::= index | hash
field-descriptor ::= field-name field-type (inverse field-name)
field-name ::= identifier { . identifier }
database-name ::= string
database-file-name ::= string
xml-file-name ::= string
file-name ::= string
server-URL ::= 'HOST:PORT'
{% endhighlight %}

SUBSQL automatically commits a read-only transaction after each select statement in order to release a shared database lock as soon as possible. But all database modification operations should be explicitly committed by a commit statement or undone by a rollback statement. open opens a new database, wherase exit closes an open database (if it was opened), and so implicitly commits the last transaction. If a database file name was not specified in the open statement, then a file name is constructed from the database name by appending the ".fdb" suffix.

The select statement always prints all record fields. FastDB doesn't support tuples: the result of the selection is always a set of objects (records). The format of the select statement output is similar with the one accepted by the insert statement (with the exception of reference fields). So it is possible to export/import a database table without references by means of the select/insert directives of SUBSQL.

The select statement prints references in the format "#hexadecimal-number". But it is not possible to use this format in the insert statement. As object references are represented in FastDB by internal object identifiers, a reference field can not be set in an insert statement (an object inserted into the database will be assigned a new OID, so it does not make sense to specify a reference field in the insert statement). To ensure database reference consistency, FastDB just ignores reference fields when new records are inserted into the table with references. You should specify the value 0 at the place of reference fields. If you omit the '*' symbol in the select statement, FastDB will output object identifiers of each selected record.

It is mandatory to provide values for all record fields in an insert statement; default values are not supported. Components of structures and arrays should be enclosed in parentheses.

It is not possible to create or drop indices and tables while other applications are working with the database. Such operations change the database scheme: after such modifications the state of other applications will become incorrect. But the delete operation doesn't change the database scheme. So it can be performed as a normal transaction, when the database is concurrently used by several applications. If SUBSQL hangs trying to execute some statement, then some other application holds the lock on the database, preventing SUBSQL from accessing it.

It is possible to specify mode of openning database by SubSQL. It can be done by SUBSQL_ACCESS_TYPE environment variable or -access command line option. The following values can be specified:


| Value | Mode | Description |
| normal | dbDatabase::dbAllAccess | Read-write access |
| read-only | dbDatabase::dbReadOnly | Read only access |
| concurrent-update | dbDatabase::dbConcurrentUpdate | Used in conjunction with concurrent read mode |
| concurrent-read | dbDatabase::dbConcurrentUpdate | Read only mode used in conjunction with concurrent update mode. In this case reads can be executed concurrently with updates. |

SubSQL can be used to start CLI and HTTP servers. CLI server accept connections of clients using CLI protocol to access database. Each client is server by separate thread. SubSQL maintains pool of thread, taking thread from the pool when client is attached and place thread back in the pool when client is disconnected.

HTTP server is used to provide view-only access to the database from Web browsers. Unlike CLI servers, only one instance of HTTP server can be started. To view main database page, just type in your Web browser URL which you have specified in start http server command.

Database can be exported as XML file using SubSQL export command. This command cause dump of the whole database in XML format to the specified file according to the following rules:

* Each record is represented by XML element with the same name as the table.
* Each record contains id attribute which specified OID of the object.
* Each record field is represented by the XML element with the same name as field.
* Values of scalar types are printed as decimal integer or float numbers.
* String literals are enclosed in "". All characters greater than 'z' or less then ' ' or equal to '%' or '"' are printed as two hex digits prepended by '%': space character = "%20".
* Raw binary types are represented by string where each byte is represented by '%' and two hex digits.
* Reference types are represented by <ref id=OID/> element, where OID is object identifier of referenced object.
* Array is represented as sequence of <array-element> elements
* Rectangle is represented by <rectangle> element with two <vertex> subelements containing list of coordinate attributes.

Produced XML file can be used to export data to other programs or for flexible restoring of database. To be able to import data from XML file you should have all table created. In C++ application it is enough to open and close database, then all described tables will be created. SubSQL import command will import data from XML file, mapping OIDs of records specified in XML file to OIDs of created records. Such export/import sequence can be used to convert database to the new format.

Lets say that you have database "YourOldDatabase" created by your application YourOldApplication and you want to convert it to new format so it can be used by new version of your application: YourNewApplication. First Of all you need to initialize new database. To do it you should run YourNewApplication and open/close database "YourNewDatabase" in it. Then prepare two SubSQL command files:

{% highlight c %}
export.sql:
open 'YourOldDatabase';
export '-'
exit
{% endhighlight %}

{% highlight c %}
import.sql:
open 'YourNewDatabase';
import '-'
exit
{% endhighlight %}

Convesion can be done using the following command:

{% highlight c %}
subsql export.xml | subsql import.xml
{% endhighlight %}

To be able to print dbDateTime in SubSQL in readable form, you should define SUBSQL_DATE_FORMAT environment variable (for example '%c'). To get more information about date time formats see documentation of strftime function. If SUBSQL_DATE_FORMAT is not defined, dbDateTime structure will be printed as normal structure with integer component. SubSQL doesn't currently allow convertion of date from string during insert or update operations.

<br>
<br>

参考资料
=================================

fastdb主页 : [http://www.garret.ru/fastdb.html](http://www.garret.ru/fastdb.html)

FastDB SourceForge主页 : [http://sourceforge.net/projects/fastdb](http://sourceforge.net/projects/fastdb)

FastDB SourceForge下载 :

[http://sourceforge.net/projects/fastdb/files/latest/download](http://sourceforge.net/projects/fastdb/files/latest/download)

参考博客 ：

[http://blog.csdn.net/fuyun10036/article/details/8620542](http://blog.csdn.net/fuyun10036/article/details/8620542)