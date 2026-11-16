#pragma once
#include <picojson.h>
#include <vector>
#include <string>
#include <type_traits>
#include <iostream>
#include <cstdlib>
// Small judge-only JSON adapter. Not a replacement for nlohmann::json.
class json {
    picojson::value value;
    static void fail(const char* message){std::cerr<<message<<std::endl;std::exit(2);}
    explicit json(picojson::value v):value(v){}
public:
    json():value(){} json(std::nullptr_t):value(){}
    json(bool v):value(v){} json(int v):value(double(v)){} json(long v):value(double(v)){}
    json(long long v):value(double(v)){} json(unsigned v):value(double(v)){} json(double v):value(v){}
    json(const std::string& v):value(v){} json(const char* v):value(std::string(v)){}
    template<class T> json(const std::vector<T>& v){picojson::array a;for(const auto& x:v)a.push_back(json(T(x)).value);value=picojson::value(a);}
    static json array(std::initializer_list<json> xs){picojson::array a;for(const auto& x:xs)a.push_back(x.value);return json(picojson::value(a));}
    json at(const std::string& key)const{if(!value.is<picojson::object>()||!value.contains(key))fail("JSON 字段不存在");return json(value.get(key));}
    json at(size_t i)const{if(!value.is<picojson::array>()||i>=value.get<picojson::array>().size())fail("JSON 数组下标越界");return json(value.get(i));}
    json operator[](const std::string& key)const{return at(key);} json operator[](size_t i)const{return at(i);}
    size_t size()const{if(value.is<picojson::array>())return value.get<picojson::array>().size();if(value.is<std::string>())return value.get<std::string>().size();if(value.is<picojson::object>())return value.get<picojson::object>().size();return 0;}
    template<class T> T get()const{
        if constexpr(std::is_same<T,std::string>::value){if(!value.is<std::string>())fail("需要字符串");return value.get<std::string>();}
        else if constexpr(std::is_same<T,bool>::value){if(!value.is<bool>())fail("需要布尔值");return value.get<bool>();}
        else if constexpr(std::is_arithmetic<T>::value){if(!value.is<double>())fail("需要数值");return static_cast<T>(value.get<double>());}
        else {if(!value.is<picojson::array>())fail("需要数组");T result;for(const auto& x:value.get<picojson::array>())result.push_back(json(x).template get<typename T::value_type>());return result;}
    }
    std::string dump()const{return value.serialize();}
    friend std::istream& operator>>(std::istream& in,json& out){std::string text((std::istreambuf_iterator<char>(in)),{});std::string error=picojson::parse(out.value,text);if(!error.empty())fail("JSON 输入格式错误");return in;}
};
