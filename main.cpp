/*
Tên file: main.cpp
Sinh viên thực hiện: [Nguyễn Thiện An]
MSSV: [25520019]
Mô tả: File này chứa hàm main() và một số hàm để nạp dữ liệu từ file để chạy chương trình Trắc nghiệm Tính cách OCEAN.
Chương trình cho phép người dùng trả lời các câu hỏi và so sánh tính cách của họ với các nhân vật trong các vũ trụ (StarWars, Hogwarts, Disney...).
*/

#include <set>
#include <vector>
#include <map>
#include <fstream>
#include <sstream>
#include <string>
#include <iostream>
#include "driver.h"

using namespace std;

/*
Hàm hỗ trợ phân tách chuỗi điểm số OCEAN (VD: "O 1 C -1") thành cấu trúc map.
Tham số: scoresPart - chuỗi chứa các ký tự OCEAN và điểm số tương ứng.
Trả về: map<char, int> chứa các cặp (yếu tố, điểm số).
*/
map<char, int> parseScores(string scoresPart)
{
    map<char, int> scores;
    stringstream ss(scoresPart);
    char oceanChar;
    int value;

    // Đọc liên tiếp từng cặp ký tự và số nguyên từ luồng chuỗi (stringstream)
    while (ss >> oceanChar >> value)
    {
        scores[oceanChar] = value;
    }
    return scores;
}

/*
Hàm đọc dữ liệu ngân hàng câu hỏi từ file văn bản.
Tham số: filename - Tên file chứa câu hỏi (VD: questions.txt).
Trả về: set chứa các đối tượng Question.
*/
set<Question> getQuestionsFromFile(string filename)
{
    set<Question> questions;
    ifstream file(filename);

    if (!file.is_open())
        throw runtime_error("File error: " + filename);

    string line;
    while (getline(file, line))
    {
        if (line.empty())
            continue;

        // Tách nội dung câu hỏi và phần điểm số dựa vào vị trí dấu chấm '.'
        size_t dotPos = line.find('.');
        string text = line.substr(0, dotPos);

        questions.insert({text, parseScores(line.substr(dotPos + 1))});
    }
    return questions;
}

/*
Hàm đọc thông tin và điểm số tính cách của các nhân vật từ file vũ trụ (.people).
Tham số: filename - Tên file chứa danh sách nhân vật (VD: Disney.people).
Trả về: set chứa các đối tượng Person.
*/
set<Person> getPeopleFromFile(string filename)
{
    set<Person> people;
    ifstream file(filename);

    if (!file.is_open())
        throw runtime_error("File error: " + filename);

    string line;
    while (getline(file, line))
    {
        if (line.empty())
            continue;

        // Tách tên nhân vật và phần điểm số dựa vào vị trí dấu chấm '.'
        size_t dotPos = line.find('.');
        string name = line.substr(0, dotPos);

        // Nạp trực tiếp đối tượng vào set, tránh vi phạm lỗi trừ 10 điểm do tạo dữ liệu thừa
        people.insert({name, parseScores(line.substr(dotPos + 1))});
    }
    return people;
}

int main()
{
    set<Question> questionBank = getQuestionsFromFile("questions.txt");
    map<Question, int> answers;
    int numQuestion;

    cout << "\n";
    cout << " +====================================================+" << endl;
    cout << " |                                                    |" << endl;
    cout << " |        CHAO MUNG BAN DEN VOI BAI TEST OCEAN        |" << endl;
    cout << " |             Kham pha vu tru tinh cach              |" << endl;
    cout << " |                                                    |" << endl;
    cout << " +====================================================+\n"
         << endl;
    cout << " [*] Ngan hang du lieu hien co: " << questionBank.size() << " cau hoi." << endl;

    do
    {
        cout << "\n [?] Ban muon tra loi bao nhieu cau? (1 - " << questionBank.size() << "): ";
        cin >> numQuestion;
        if (numQuestion < 1 || numQuestion > (int)questionBank.size())
            cout << " [!] So luong khong hop le. Vui long nhap lai!" << endl;
    } while (numQuestion < 1 || numQuestion > (int)questionBank.size());

    cout << "\n .--------------------------------------------------." << endl;
    cout << " |               THANG DIEM DANH GIA                |" << endl;
    cout << " |--------------------------------------------------|" << endl;
    cout << " |  1: Rat khong dong y (Strongly Disagree)         |" << endl;
    cout << " |  2: Khong dong y (Disagree)                      |" << endl;
    cout << " |  3: Trung lap (Neutral)                          |" << endl;
    cout << " |  4: Dong y (Agree)                               |" << endl;
    cout << " |  5: Rat dong y (Strongly Agree)                  |" << endl;
    cout << " '--------------------------------------------------'" << endl;
    cout << " \n * BAT DAU LAM BAI! *\n";

    // Dùng vòng lặp để in ra câu hỏi và lấy câu trả lời của người dùng
    for (int i = 0; i < numQuestion; i++)
    {
        Question question = randomQuestionFrom(questionBank);
        int point;

        // Kiểm tra dữ liệu nhập vào của người dùng xem có hợp lệ hay không
        while (true)
        {
            cout << "\n [ Cau " << i + 1 << " ]" << endl;
            cout << " [?] " << question.questionText << endl;
            cout << " >> Tra loi (1-5): ";

            // Nếu input hợp lệ thì break;
            if (cin >> point && point >= 1 && point <= 5)
            {
                answers[question] = point;
                break;
            }
            else
            {
                cout << " [!] Vui long chi nhap so tu 1 den 5!" << endl;
                cin.clear();
                cin.ignore(10000, '\n');
            }
        }
    }

    map<char, int> scores = scoresFrom(answers);

    cout << "\n\n +====================================================+" << endl;
    cout << " |            KET QUA PHAN TICH TINH CACH             |" << endl;
    cout << " +====================================================+" << endl;

    for (const auto &s : scores)
    {
        cout << "    * " << s.first << ": " << s.second << " diem" << endl;
    }
    cout << "  ----------------------------------------------------" << endl;
    cout << "  => KET LUAN: Ban la mot nguoi\n";

    vector<char> dominantTraits;
    double maxScores = -9999;

    // Tìm yếu tố có điểm cao nhất của người dùng
    for (const auto &s : scores)
    {
        if (s.second > maxScores)
            maxScores = s.second;
    }

    // Nếu có nhiều điểm cao nhất thì lưu vào vector
    for (const auto &s : scores)
    {
        if (s.second == maxScores)
            dominantTraits.push_back(s.first);
    }

    // In ra đặc điểm của người dùng
    for (char &trait : dominantTraits)
    {
        switch (trait)
        {
        case 'O':
            cout << "  - Coi mo (Openness): Ban sang tao, giau tri tuong tuong va thich kham pha!\n";
            break;
        case 'C':
            cout << "  - Tan tam (Conscientious): Ban co to chuc, ky luat cao va dang tin cay!\n";
            break;
        case 'E':
            cout << "  - Huong ngoai (Extrovert): Ban nang dong, thich giao tiep va tran day nang luong!\n";
            break;
        case 'A':
            cout << "  - De chiu (Agreeable): Ban than thien, hoa dong, va luon quan tam den nguoi khac!\n";
            break;
        case 'N':
            cout << "  - Nhay cam (Neuroticism): Ban sau sac, than trong va co doi song noi tam phong phu!\n";
            break;
        }
    }

    string filename;
    set<Person> people;

    cout << "\n .--------------------------------------------------." << endl;
    cout << " |            DANH SACH VU TRU NHAN VAT             |" << endl;
    cout << " |--------------------------------------------------|" << endl;
    cout << " |  - BabyAnimals.people   - MyersBriggs.people     |" << endl;
    cout << " |  - Brooklyn99.people    - SesameStreet.people    |" << endl;
    cout << " |  - Disney.people        - StarWars.people        |" << endl;
    cout << " |  - Hogwarts.people      - Vegetables.people      |" << endl;
    cout << " '--------------------------------------------------'" << endl;

    // Kiểm tra input của người dùng xem có nhập đúng tên file hay không
    while (1)
    {
        cout << "\n [?] Nhap ten vu tru ban muon so sanh (VD: Disney.people): ";
        cin >> filename;
        try
        {
            people = getPeopleFromFile(filename);
            break;
        }
        catch (...)
        {
            cout << " [!] Khong tim thay file! Vui long nhap dung ten vu tru co duoi .people";
        }
    }

    Person bestMatch = mostSimilarTo(scores, people);

    cout << "\n";
    cout << " ******************************************************" << endl;
    cout << " *             NHAN VAT GIONG VOI BAN NHAT            *" << endl;
    cout << " ******************************************************" << endl;
    cout << "  >> Vu tru ban chon: " << filename << endl;
    cout << "  >> Nhan vat cua ban: " << bestMatch.name << "\n\n";
    cout << " ******************************************************" << endl;

    cout << "\n Cam on ban da tham gia bai test." << endl;
    cout << " Tam biet co Boi xinh dep! :love :love\n\n";

    return 0;
}