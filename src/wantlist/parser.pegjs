File = parts:(Options / Comment / EmptyLine / OfficialNames / WantlistEntry)+ !. {return parts.filter((a) => a != null)}

Options = options:(BooleanOption / ValueOption)+ {return {options: options.reduce((prev, next) => ({...prev, ...next}), {})};}

BooleanOption = "#!"[ \t]*optionname:([^\n=]*)([\n] / !.) { return {[optionname.join("")]: true}; }
ValueOption = "#!"[ \t]*optionname:([^\n=]*)"="optionvalue:([^\n]*)([\n] / !.) { return {[optionname.join("")]: optionvalue.join("")}; }

Comment = "#"!"!"[^\n]*([\n] / !.) {return null}
EmptyLine = [\n] {return null}

OfficialNames = "!BEGIN-OFFICIAL-NAMES"[\n]?names:(id:$[0-9A-Za-z-]+" ""==> "?friendly:$([^\n]+)[\n] {return {id, friendly}})+[\n]?"!END-OFFICIAL-NAMES" {return {officialNames: names}}

WantlistEntry = username:("("@$[^)]+")")? _ giving:($[%0-9A-Za-z-]+) _ ":" _ wants:(@$[%0-9A-Za-z-]+ _)* {return {username, giving, wants}}

_ = " "*