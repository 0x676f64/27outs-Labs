// House of Representatives Members Data
// Format: 'DISTRICT_ID': { name, party, electionYear, margin }

const houseMembers = {
  // Alabama
  'AL-1': { name: 'Barry Moore', party: 'R', electionYear: 2024, margin: '+31.2%' },
  'AL-2': { name: 'Shomari Figures', party: 'D', electionYear: 2024, margin: '+5.8%' },
  'AL-3': { name: 'Mike Rogers', party: 'R', electionYear: 2024, margin: '+33.4%' },
  'AL-4': { name: 'Robert Aderholt', party: 'R', electionYear: 2024, margin: '+55.6%' },
  'AL-5': { name: 'Dale Strong', party: 'R', electionYear: 2024, margin: '+37.8%' },
  'AL-6': { name: 'Gary Palmer', party: 'R', electionYear: 2024, margin: '+44.2%' },
  'AL-7': { name: 'Terri Sewell', party: 'D', electionYear: 2024, margin: '+42.1%' },

  // Alaska
  'AK-AL': { name: 'Nick Begich', party: 'R', electionYear: 2024, margin: '+3.1%' },

  // Arizona
  'AZ-1': { name: 'David Schweikert', party: 'R', electionYear: 2024, margin: '+1.8%' },
  'AZ-2': { name: 'Eli Crane', party: 'R', electionYear: 2024, margin: '+13.4%' },
  'AZ-3': { name: 'Ruben Gallego', party: 'D', electionYear: 2024, margin: '+28.7%' },
  'AZ-4': { name: 'Greg Stanton', party: 'D', electionYear: 2024, margin: '+8.2%' },
  'AZ-5': { name: 'Andy Biggs', party: 'R', electionYear: 2024, margin: '+21.5%' },
  'AZ-6': { name: 'Juan Ciscomani', party: 'R', electionYear: 2024, margin: '+2.1%' },
  'AZ-7': { name: 'Raúl Grijalva', party: 'D', electionYear: 2024, margin: '+18.4%' },
  'AZ-8': { name: 'Debbie Lesko', party: 'R', electionYear: 2024, margin: '+16.9%' },
  'AZ-9': { name: 'Paul Gosar', party: 'R', electionYear: 2024, margin: '+35.2%' },

  // Arkansas
  'AR-1': { name: 'Rick Crawford', party: 'R', electionYear: 2024, margin: '+42.8%' },
  'AR-2': { name: 'French Hill', party: 'R', electionYear: 2024, margin: '+18.3%' },
  'AR-3': { name: 'Steve Womack', party: 'R', electionYear: 2024, margin: '+43.1%' },
  'AR-4': { name: 'Bruce Westerman', party: 'R', electionYear: 2024, margin: '+45.7%' },

  // California
  'CA-1': { name: 'Doug LaMalfa', party: 'R', electionYear: 2024, margin: '+24.8%' },
  'CA-2': { name: 'Jared Huffman', party: 'D', electionYear: 2024, margin: '+38.2%' },
  'CA-3': { name: 'Kevin Kiley', party: 'R', electionYear: 2024, margin: '+7.4%' },
  'CA-4': { name: 'Mike Thompson', party: 'D', electionYear: 2024, margin: '+32.1%' },
  'CA-5': { name: 'Tom McClintock', party: 'R', electionYear: 2024, margin: '+18.9%' },
  'CA-6': { name: 'Ami Bera', party: 'D', electionYear: 2024, margin: '+11.5%' },
  'CA-7': { name: 'Doris Matsui', party: 'D', electionYear: 2024, margin: '+42.3%' },
  'CA-8': { name: 'John Garamendi', party: 'D', electionYear: 2024, margin: '+26.7%' },
  'CA-9': { name: 'Josh Harder', party: 'D', electionYear: 2024, margin: '+5.2%' },
  'CA-10': { name: 'Mark DeSaulnier', party: 'D', electionYear: 2024, margin: '+38.4%' },
  'CA-11': { name: 'Nancy Pelosi', party: 'D', electionYear: 2024, margin: '+65.8%' },
  'CA-12': { name: 'Barbara Lee', party: 'D', electionYear: 2024, margin: '+72.1%' },
  'CA-13': { name: 'John Duarte', party: 'R', electionYear: 2024, margin: '+2.3%' },
  'CA-14': { name: 'Eric Swalwell', party: 'D', electionYear: 2024, margin: '+42.9%' },
  'CA-15': { name: 'Kevin Mullin', party: 'D', electionYear: 2024, margin: '+45.2%' },
  'CA-16': { name: 'Anna Eshoo', party: 'D', electionYear: 2024, margin: '+38.6%' },
  'CA-17': { name: 'Ro Khanna', party: 'D', electionYear: 2024, margin: '+46.3%' },
  'CA-18': { name: 'Zoe Lofgren', party: 'D', electionYear: 2024, margin: '+44.1%' },
  'CA-19': { name: 'Jimmy Panetta', party: 'D', electionYear: 2024, margin: '+36.8%' },
  'CA-20': { name: 'Jimmy Gomez', party: 'D', electionYear: 2024, margin: '+68.2%' },
  'CA-21': { name: 'Jim Costa', party: 'D', electionYear: 2024, margin: '+8.7%' },
  'CA-22': { name: 'David Valadao', party: 'R', electionYear: 2024, margin: '+4.6%' },
  'CA-23': { name: 'Jay Obernolte', party: 'R', electionYear: 2024, margin: '+24.5%' },
  'CA-24': { name: 'Salud Carbajal', party: 'D', electionYear: 2024, margin: '+18.9%' },
  'CA-25': { name: 'Raul Ruiz', party: 'D', electionYear: 2024, margin: '+12.4%' },
  'CA-26': { name: 'Julia Brownley', party: 'D', electionYear: 2024, margin: '+16.7%' },
  'CA-27': { name: 'Mike Garcia', party: 'R', electionYear: 2024, margin: '+6.8%' },
  'CA-28': { name: 'Judy Chu', party: 'D', electionYear: 2024, margin: '+52.3%' },
  'CA-29': { name: 'Tony Cárdenas', party: 'D', electionYear: 2024, margin: '+48.9%' },
  'CA-30': { name: 'Adam Schiff', party: 'D', electionYear: 2024, margin: '+56.2%' },
  'CA-31': { name: 'Grace Napolitano', party: 'D', electionYear: 2024, margin: '+44.7%' },
  'CA-32': { name: 'Brad Sherman', party: 'D', electionYear: 2024, margin: '+42.8%' },
  'CA-33': { name: 'Pete Aguilar', party: 'D', electionYear: 2024, margin: '+26.1%' },
  'CA-34': { name: 'Jimmy Gomez', party: 'D', electionYear: 2024, margin: '+68.4%' },
  'CA-35': { name: 'Norma Torres', party: 'D', electionYear: 2024, margin: '+24.3%' },
  'CA-36': { name: 'Ted Lieu', party: 'D', electionYear: 2024, margin: '+39.2%' },
  'CA-37': { name: 'Sydney Kamlager-Dove', party: 'D', electionYear: 2024, margin: '+58.7%' },
  'CA-38': { name: 'Linda Sánchez', party: 'D', electionYear: 2024, margin: '+36.8%' },
  'CA-39': { name: 'Mark Takano', party: 'D', electionYear: 2024, margin: '+28.4%' },
  'CA-40': { name: 'Young Kim', party: 'R', electionYear: 2024, margin: '+7.2%' },
  'CA-41': { name: 'Ken Calvert', party: 'R', electionYear: 2024, margin: '+9.3%' },
  'CA-42': { name: 'Robert Garcia', party: 'D', electionYear: 2024, margin: '+37.4%' },
  'CA-43': { name: 'Maxine Waters', party: 'D', electionYear: 2024, margin: '+58.9%' },
  'CA-44': { name: 'Nanette Barragán', party: 'D', electionYear: 2024, margin: '+48.2%' },
  'CA-45': { name: 'Michelle Steel', party: 'R', electionYear: 2024, margin: '+5.8%' },
  'CA-46': { name: 'Lou Correa', party: 'D', electionYear: 2024, margin: '+32.6%' },
  'CA-47': { name: 'Katie Porter', party: 'D', electionYear: 2024, margin: '+14.2%' },
  'CA-48': { name: 'Darrell Issa', party: 'R', electionYear: 2024, margin: '+13.7%' },
  'CA-49': { name: 'Mike Levin', party: 'D', electionYear: 2024, margin: '+8.4%' },
  'CA-50': { name: 'Scott Peters', party: 'D', electionYear: 2024, margin: '+22.1%' },
  'CA-51': { name: 'Sara Jacobs', party: 'D', electionYear: 2024, margin: '+38.6%' },
  'CA-52': { name: 'Juan Vargas', party: 'D', electionYear: 2024, margin: '+42.8%' },

  // Colorado
  'CO-1': { name: 'Diana DeGette', party: 'D', electionYear: 2024, margin: '+48.2%' },
  'CO-2': { name: 'Joe Neguse', party: 'D', electionYear: 2024, margin: '+32.4%' },
  'CO-3': { name: 'Jeff Hurd', party: 'R', electionYear: 2024, margin: '+4.8%' },
  'CO-4': { name: 'Lauren Boebert', party: 'R', electionYear: 2024, margin: '+18.2%' },
  'CO-5': { name: 'Jeff Crank', party: 'R', electionYear: 2024, margin: '+12.6%' },
  'CO-6': { name: 'Jason Crow', party: 'D', electionYear: 2024, margin: '+16.8%' },
  'CO-7': { name: 'Brittany Pettersen', party: 'D', electionYear: 2024, margin: '+11.4%' },
  'CO-8': { name: 'Yadira Caraveo', party: 'D', electionYear: 2024, margin: '+2.1%' },

  // Connecticut
  'CT-1': { name: 'John Larson', party: 'D', electionYear: 2024, margin: '+38.6%' },
  'CT-2': { name: 'Joe Courtney', party: 'D', electionYear: 2024, margin: '+28.9%' },
  'CT-3': { name: 'Rosa DeLauro', party: 'D', electionYear: 2024, margin: '+42.3%' },
  'CT-4': { name: 'Jim Himes', party: 'D', electionYear: 2024, margin: '+24.7%' },
  'CT-5': { name: 'Jahana Hayes', party: 'D', electionYear: 2024, margin: '+6.8%' },

  // Delaware
  'DE-AL': { name: 'Lisa Blunt Rochester', party: 'D', electionYear: 2024, margin: '+18.4%' },

  // Florida
  'FL-1': { name: 'Matt Gaetz', party: 'R', electionYear: 2024, margin: '+34.2%' },
  'FL-2': { name: 'Neal Dunn', party: 'R', electionYear: 2024, margin: '+28.6%' },
  'FL-3': { name: 'Kat Cammack', party: 'R', electionYear: 2024, margin: '+22.4%' },
  'FL-4': { name: 'Aaron Bean', party: 'R', electionYear: 2024, margin: '+24.8%' },
  'FL-5': { name: 'Mike Waltz', party: 'R', electionYear: 2024, margin: '+32.1%' },
  'FL-6': { name: 'Michael Waltz', party: 'R', electionYear: 2024, margin: '+28.9%' },
  'FL-7': { name: 'Cory Mills', party: 'R', electionYear: 2024, margin: '+18.7%' },
  'FL-8': { name: 'Bill Posey', party: 'R', electionYear: 2024, margin: '+26.3%' },
  'FL-9': { name: 'Darren Soto', party: 'D', electionYear: 2024, margin: '+14.2%' },
  'FL-10': { name: 'Maxwell Frost', party: 'D', electionYear: 2024, margin: '+24.6%' },
  'FL-11': { name: 'Daniel Webster', party: 'R', electionYear: 2024, margin: '+32.8%' },
  'FL-12': { name: 'Gus Bilirakis', party: 'R', electionYear: 2024, margin: '+28.4%' },
  'FL-13': { name: 'Anna Paulina Luna', party: 'R', electionYear: 2024, margin: '+8.6%' },
  'FL-14': { name: 'Kathy Castor', party: 'D', electionYear: 2024, margin: '+22.7%' },
  'FL-15': { name: 'Laurel Lee', party: 'R', electionYear: 2024, margin: '+16.8%' },
  'FL-16': { name: 'Vern Buchanan', party: 'R', electionYear: 2024, margin: '+24.2%' },
  'FL-17': { name: 'Greg Steube', party: 'R', electionYear: 2024, margin: '+34.6%' },
  'FL-18': { name: 'Brian Mast', party: 'R', electionYear: 2024, margin: '+26.9%' },
  'FL-19': { name: 'Byron Donalds', party: 'R', electionYear: 2024, margin: '+38.2%' },
  'FL-20': { name: 'Sheila Cherfilus-McCormick', party: 'D', electionYear: 2024, margin: '+42.8%' },
  'FL-21': { name: 'Lois Frankel', party: 'D', electionYear: 2024, margin: '+28.4%' },
  'FL-22': { name: 'Jared Moskowitz', party: 'D', electionYear: 2024, margin: '+18.6%' },
  'FL-23': { name: 'Debbie Wasserman Schultz', party: 'D', electionYear: 2024, margin: '+32.1%' },
  'FL-24': { name: 'Frederica Wilson', party: 'D', electionYear: 2024, margin: '+58.9%' },
  'FL-25': { name: 'Mario Díaz-Balart', party: 'R', electionYear: 2024, margin: '+22.4%' },
  'FL-26': { name: 'Carlos Giménez', party: 'R', electionYear: 2024, margin: '+18.7%' },
  'FL-27': { name: 'María Elvira Salazar', party: 'R', electionYear: 2024, margin: '+12.3%' },
  'FL-28': { name: 'Carlos Gimenez', party: 'R', electionYear: 2024, margin: '+29.1%' },

  // Georgia
  'GA-1': { name: 'Buddy Carter', party: 'R', electionYear: 2024, margin: '+28.4%' },
  'GA-2': { name: 'Sanford Bishop', party: 'D', electionYear: 2024, margin: '+18.6%' },
  'GA-3': { name: 'Drew Ferguson', party: 'R', electionYear: 2024, margin: '+32.8%' },
  'GA-4': { name: 'Hank Johnson', party: 'D', electionYear: 2024, margin: '+52.3%' },
  'GA-5': { name: 'Nikema Williams', party: 'D', electionYear: 2024, margin: '+58.7%' },
  'GA-6': { name: 'Rich McCormick', party: 'R', electionYear: 2024, margin: '+8.4%' },
  'GA-7': { name: 'Lucy McBath', party: 'D', electionYear: 2024, margin: '+11.2%' },
  'GA-8': { name: 'Austin Scott', party: 'R', electionYear: 2024, margin: '+36.9%' },
  'GA-9': { name: 'Andrew Clyde', party: 'R', electionYear: 2024, margin: '+42.1%' },
  'GA-10': { name: 'Mike Collins', party: 'R', electionYear: 2024, margin: '+34.6%' },
  'GA-11': { name: 'Barry Loudermilk', party: 'R', electionYear: 2024, margin: '+28.2%' },
  'GA-12': { name: 'Rick Allen', party: 'R', electionYear: 2024, margin: '+26.7%' },
  'GA-13': { name: 'David Scott', party: 'D', electionYear: 2024, margin: '+48.9%' },
  'GA-14': { name: 'Marjorie Taylor Greene', party: 'R', electionYear: 2024, margin: '+44.3%' },

  // Hawaii
  'HI-1': { name: 'Ed Case', party: 'D', electionYear: 2024, margin: '+48.6%' },
  'HI-2': { name: 'Jill Tokuda', party: 'D', electionYear: 2024, margin: '+52.3%' },

  // Idaho
  'ID-1': { name: 'Russ Fulcher', party: 'R', electionYear: 2024, margin: '+42.8%' },
  'ID-2': { name: 'Mike Simpson', party: 'R', electionYear: 2024, margin: '+36.4%' },

  // Illinois
  'IL-1': { name: 'Jonathan Jackson', party: 'D', electionYear: 2024, margin: '+62.4%' },
  'IL-2': { name: 'Robin Kelly', party: 'D', electionYear: 2024, margin: '+58.9%' },
  'IL-3': { name: 'Delia Ramirez', party: 'D', electionYear: 2024, margin: '+48.2%' },
  'IL-4': { name: 'Jesús "Chuy" García', party: 'D', electionYear: 2024, margin: '+64.7%' },
  'IL-5': { name: 'Mike Quigley', party: 'D', electionYear: 2024, margin: '+46.8%' },
  'IL-6': { name: 'Sean Casten', party: 'D', electionYear: 2024, margin: '+18.4%' },
  'IL-7': { name: 'Danny Davis', party: 'D', electionYear: 2024, margin: '+68.2%' },
  'IL-8': { name: 'Raja Krishnamoorthi', party: 'D', electionYear: 2024, margin: '+32.6%' },
  'IL-9': { name: 'Jan Schakowsky', party: 'D', electionYear: 2024, margin: '+52.1%' },
  'IL-10': { name: 'Brad Schneider', party: 'D', electionYear: 2024, margin: '+24.3%' },
  'IL-11': { name: 'Bill Foster', party: 'D', electionYear: 2024, margin: '+22.8%' },
  'IL-12': { name: 'Mike Bost', party: 'R', electionYear: 2024, margin: '+28.6%' },
  'IL-13': { name: 'Nikki Budzinski', party: 'D', electionYear: 2024, margin: '+8.7%' },
  'IL-14': { name: 'Lauren Underwood', party: 'D', electionYear: 2024, margin: '+6.4%' },
  'IL-15': { name: 'Mary Miller', party: 'R', electionYear: 2024, margin: '+38.2%' },
  'IL-16': { name: 'Darin LaHood', party: 'R', electionYear: 2024, margin: '+34.9%' },
  'IL-17': { name: 'Eric Sorensen', party: 'D', electionYear: 2024, margin: '+5.2%' },

  // Indiana
  'IN-1': { name: 'Frank Mrvan', party: 'D', electionYear: 2024, margin: '+18.4%' },
  'IN-2': { name: 'Rudy Yakym', party: 'R', electionYear: 2024, margin: '+24.6%' },
  'IN-3': { name: 'Jim Banks', party: 'R', electionYear: 2024, margin: '+42.8%' },
  'IN-4': { name: 'Jim Baird', party: 'R', electionYear: 2024, margin: '+38.2%' },
  'IN-5': { name: 'Victoria Spartz', party: 'R', electionYear: 2024, margin: '+16.8%' },
  'IN-6': { name: 'Jefferson Shreve', party: 'R', electionYear: 2024, margin: '+32.4%' },
  'IN-7': { name: 'André Carson', party: 'D', electionYear: 2024, margin: '+36.9%' },
  'IN-8': { name: 'Larry Bucshon', party: 'R', electionYear: 2024, margin: '+34.7%' },
  'IN-9': { name: 'Erin Houchin', party: 'R', electionYear: 2024, margin: '+28.3%' },

  // Iowa
  'IA-1': { name: 'Mariannette Miller-Meeks', party: 'R', electionYear: 2024, margin: '+5.8%' },
  'IA-2': { name: 'Ashley Hinson', party: 'R', electionYear: 2024, margin: '+18.2%' },
  'IA-3': { name: 'Zach Nunn', party: 'R', electionYear: 2024, margin: '+2.4%' },
  'IA-4': { name: 'Randy Feenstra', party: 'R', electionYear: 2024, margin: '+36.8%' },

  // Kansas
  'KS-1': { name: 'Tracey Mann', party: 'R', electionYear: 2024, margin: '+48.6%' },
  'KS-2': { name: 'Derek Schmidt', party: 'R', electionYear: 2024, margin: '+12.4%' },
  'KS-3': { name: 'Sharice Davids', party: 'D', electionYear: 2024, margin: '+8.7%' },
  'KS-4': { name: 'Ron Estes', party: 'R', electionYear: 2024, margin: '+32.1%' },

  // Kentucky
  'KY-1': { name: 'James Comer', party: 'R', electionYear: 2024, margin: '+44.8%' },
  'KY-2': { name: 'Brett Guthrie', party: 'R', electionYear: 2024, margin: '+36.2%' },
  'KY-3': { name: 'Morgan McGarvey', party: 'D', electionYear: 2024, margin: '+22.4%' },
  'KY-4': { name: 'Thomas Massie', party: 'R', electionYear: 2024, margin: '+42.6%' },
  'KY-5': { name: 'Hal Rogers', party: 'R', electionYear: 2024, margin: '+52.8%' },
  'KY-6': { name: 'Andy Barr', party: 'R', electionYear: 2024, margin: '+18.9%' },

  // Louisiana
  'LA-1': { name: 'Steve Scalise', party: 'R', electionYear: 2024, margin: '+38.4%' },
  'LA-2': { name: 'Troy Carter', party: 'D', electionYear: 2024, margin: '+52.6%' },
  'LA-3': { name: 'Clay Higgins', party: 'R', electionYear: 2024, margin: '+42.8%' },
  'LA-4': { name: 'Mike Johnson', party: 'R', electionYear: 2024, margin: '+46.2%' },
  'LA-5': { name: 'Julia Letlow', party: 'R', electionYear: 2024, margin: '+48.9%' },
  'LA-6': { name: 'Garret Graves', party: 'R', electionYear: 2024, margin: '+32.7%' },

  // Maine
  'ME-1': { name: 'Chellie Pingree', party: 'D', electionYear: 2024, margin: '+28.4%' },
  'ME-2': { name: 'Jared Golden', party: 'D', electionYear: 2024, margin: '+3.2%' },

  // Maryland
  'MD-1': { name: 'Andy Harris', party: 'R', electionYear: 2024, margin: '+28.6%' },
  'MD-2': { name: 'Dutch Ruppersberger', party: 'D', electionYear: 2024, margin: '+26.8%' },
  'MD-3': { name: 'John Sarbanes', party: 'D', electionYear: 2024, margin: '+34.2%' },
  'MD-4': { name: 'Glenn Ivey', party: 'D', electionYear: 2024, margin: '+58.9%' },
  'MD-5': { name: 'Steny Hoyer', party: 'D', electionYear: 2024, margin: '+44.7%' },
  'MD-6': { name: 'Neil Parrott', party: 'R', electionYear: 2024, margin: '+4.8%' },
  'MD-7': { name: 'Kweisi Mfume', party: 'D', electionYear: 2024, margin: '+62.3%' },
  'MD-8': { name: 'Jamie Raskin', party: 'D', electionYear: 2024, margin: '+38.6%' },

  // Massachusetts
  'MA-1': { name: 'Richard Neal', party: 'D', electionYear: 2024, margin: '+48.2%' },
  'MA-2': { name: 'Jim McGovern', party: 'D', electionYear: 2024, margin: '+42.6%' },
  'MA-3': { name: 'Lori Trahan', party: 'D', electionYear: 2024, margin: '+28.9%' },
  'MA-4': { name: 'Jake Auchincloss', party: 'D', electionYear: 2024, margin: '+38.4%' },
  'MA-5': { name: 'Katherine Clark', party: 'D', electionYear: 2024, margin: '+52.7%' },
  'MA-6': { name: 'Seth Moulton', party: 'D', electionYear: 2024, margin: '+46.8%' },
  'MA-7': { name: 'Ayanna Pressley', party: 'D', electionYear: 2024, margin: '+68.4%' },
  'MA-8': { name: 'Stephen Lynch', party: 'D', electionYear: 2024, margin: '+54.2%' },
  'MA-9': { name: 'Bill Keating', party: 'D', electionYear: 2024, margin: '+36.7%' },

  // Michigan
  'MI-1': { name: 'Jack Bergman', party: 'R', electionYear: 2024, margin: '+32.8%' },
  'MI-2': { name: 'John Moolenaar', party: 'R', electionYear: 2024, margin: '+28.4%' },
  'MI-3': { name: 'Hillary Scholten', party: 'D', electionYear: 2024, margin: '+14.6%' },
  'MI-4': { name: 'Bill Huizenga', party: 'R', electionYear: 2024, margin: '+24.8%' },
  'MI-5': { name: 'Tim Walberg', party: 'R', electionYear: 2024, margin: '+18.2%' },
  'MI-6': { name: 'Debbie Dingell', party: 'D', electionYear: 2024, margin: '+38.6%' },
  'MI-7': { name: 'Elissa Slotkin', party: 'D', electionYear: 2024, margin: '+8.4%' },
  'MI-8': { name: 'Dan Kildee', party: 'D', electionYear: 2024, margin: '+16.7%' },
  'MI-9': { name: 'Lisa McClain', party: 'R', electionYear: 2024, margin: '+34.2%' },
  'MI-10': { name: 'John James', party: 'R', electionYear: 2024, margin: '+11.8%' },
  'MI-11': { name: 'Haley Stevens', party: 'D', electionYear: 2024, margin: '+18.9%' },
  'MI-12': { name: 'Rashida Tlaib', party: 'D', electionYear: 2024, margin: '+58.3%' },
  'MI-13': { name: 'Shri Thanedar', party: 'D', electionYear: 2024, margin: '+62.7%' },

  // Minnesota
  'MN-1': { name: 'Brad Finstad', party: 'R', electionYear: 2024, margin: '+8.6%' },
  'MN-2': { name: 'Angie Craig', party: 'D', electionYear: 2024, margin: '+5.4%' },
  'MN-3': { name: 'Dean Phillips', party: 'D', electionYear: 2024, margin: '+22.8%' },
  'MN-4': { name: 'Betty McCollum', party: 'D', electionYear: 2024, margin: '+48.6%' },
  'MN-5': { name: 'Ilhan Omar', party: 'D', electionYear: 2024, margin: '+54.2%' },
  'MN-6': { name: 'Tom Emmer', party: 'R', electionYear: 2024, margin: '+16.4%' },
  'MN-7': { name: 'Michelle Fischbach', party: 'R', electionYear: 2024, margin: '+24.7%' },
  'MN-8': { name: 'Pete Stauber', party: 'R', electionYear: 2024, margin: '+18.9%' },

  // Mississippi
  'MS-1': { name: 'Trent Kelly', party: 'R', electionYear: 2024, margin: '+42.6%' },
  'MS-2': { name: 'Bennie Thompson', party: 'D', electionYear: 2024, margin: '+44.8%' },
  'MS-3': { name: 'Michael Guest', party: 'R', electionYear: 2024, margin: '+36.4%' },
  'MS-4': { name: 'Mike Ezell', party: 'R', electionYear: 2024, margin: '+38.9%' },

  // Missouri
  'MO-1': { name: 'Cori Bush', party: 'D', electionYear: 2024, margin: '+52.8%' },
  'MO-2': { name: 'Ann Wagner', party: 'R', electionYear: 2024, margin: '+18.6%' },
  'MO-3': { name: 'Blaine Luetkemeyer', party: 'R', electionYear: 2024, margin: '+36.2%' },
  'MO-4': { name: 'Mark Alford', party: 'R', electionYear: 2024, margin: '+44.8%' },
  'MO-5': { name: 'Emanuel Cleaver', party: 'D', electionYear: 2024, margin: '+28.4%' },
  'MO-6': { name: 'Sam Graves', party: 'R', electionYear: 2024, margin: '+42.3%' },
  'MO-7': { name: 'Eric Burlison', party: 'R', electionYear: 2024, margin: '+46.7%' },
  'MO-8': { name: 'Jason Smith', party: 'R', electionYear: 2024, margin: '+48.9%' },

  // Montana
  'MT-1': { name: 'Ryan Zinke', party: 'R', electionYear: 2024, margin: '+14.8%' },
  'MT-2': { name: 'Troy Downing', party: 'R', electionYear: 2024, margin: '+24.6%' },

  // Nebraska
  'NE-1': { name: 'Mike Flood', party: 'R', electionYear: 2024, margin: '+28.4%' },
  'NE-2': { name: 'Don Bacon', party: 'R', electionYear: 2024, margin: '+4.2%' },
  'NE-3': { name: 'Adrian Smith', party: 'R', electionYear: 2024, margin: '+52.6%' },

  // Nevada
  'NV-1': { name: 'Dina Titus', party: 'D', electionYear: 2024, margin: '+24.8%' },
  'NV-2': { name: 'Mark Amodei', party: 'R', electionYear: 2024, margin: '+18.6%' },
  'NV-3': { name: 'Susie Lee', party: 'D', electionYear: 2024, margin: '+6.4%' },
  'NV-4': { name: 'Steven Horsford', party: 'D', electionYear: 2024, margin: '+8.2%' },

  // New Hampshire
  'NH-1': { name: 'Chris Pappas', party: 'D', electionYear: 2024, margin: '+5.8%' },
  'NH-2': { name: 'Ann McLane Kuster', party: 'D', electionYear: 2024, margin: '+12.4%' },

  // New Jersey
  'NJ-1': { name: 'Donald Norcross', party: 'D', electionYear: 2024, margin: '+38.2%' },
  'NJ-2': { name: 'Jeff Van Drew', party: 'R', electionYear: 2024, margin: '+16.8%' },
  'NJ-3': { name: 'Herb Conaway', party: 'D', electionYear: 2024, margin: '+6.7%' },
  'NJ-4': { name: 'Chris Smith', party: 'R', electionYear: 2024, margin: '+22.4%' },
  'NJ-5': { name: 'Josh Gottheimer', party: 'D', electionYear: 2024, margin: '+14.2%' },
  'NJ-6': { name: 'Frank Pallone', party: 'D', electionYear: 2024, margin: '+32.6%' },
  'NJ-7': { name: 'Tom Kean Jr.', party: 'R', electionYear: 2024, margin: '+4.8%' },
  'NJ-8': { name: 'Rob Menendez', party: 'D', electionYear: 2024, margin: '+48.9%' },
  'NJ-9': { name: 'Bill Pascrell', party: 'D', electionYear: 2024, margin: '+52.3%' },
  'NJ-10': { name: 'LaMonica McIver', party: 'D', electionYear: 2024, margin: '+58.7%' },
  'NJ-11': { name: 'Mikie Sherrill', party: 'D', electionYear: 2024, margin: '+18.4%' },
  'NJ-12': { name: 'Bonnie Watson Coleman', party: 'D', electionYear: 2024, margin: '+44.6%' },

  // New Mexico
  'NM-1': { name: 'Melanie Stansbury', party: 'D', electionYear: 2024, margin: '+28.4%' },
  'NM-2': { name: 'Gabe Vasquez', party: 'D', electionYear: 2024, margin: '+4.2%' },
  'NM-3': { name: 'Teresa Leger Fernández', party: 'D', electionYear: 2024, margin: '+32.8%' },

  // New York
  'NY-1': { name: 'Nick LaLota', party: 'R', electionYear: 2024, margin: '+8.6%' },
  'NY-2': { name: 'Andrew Garbarino', party: 'R', electionYear: 2024, margin: '+14.2%' },
  'NY-3': { name: 'Tom Suozzi', party: 'D', electionYear: 2024, margin: '+8.8%' },
  'NY-4': { name: 'Anthony D\'Esposito', party: 'R', electionYear: 2024, margin: '+4.1%' },
  'NY-5': { name: 'Gregory Meeks', party: 'D', electionYear: 2024, margin: '+54.7%' },
  'NY-6': { name: 'Grace Meng', party: 'D', electionYear: 2024, margin: '+48.3%' },
  'NY-7': { name: 'Nydia Velázquez', party: 'D', electionYear: 2024, margin: '58.9%' },
  'NY-8': { name: 'Hakeem Jeffries', party: 'D', electionYear: 2024, margin: '+62.4%' },
  'NY-9': { name: 'Yvette Clarke', party: 'D', electionYear: 2024, margin: '+64.2%' },
  'NY-10': { name: 'Dan Goldman', party: 'D', electionYear: 2024, margin: '+52.8%' },
  'NY-11': { name: 'Nicole Malliotakis', party: 'R', electionYear: 2024, margin: '+16.7%' },
  'NY-12': { name: 'Jerrold Nadler', party: 'D', electionYear: 2024, margin: '+56.3%' },
  'NY-13': { name: 'Adriano Espaillat', party: 'D', electionYear: 2024, margin: '+68.4%' },
  'NY-14': { name: 'Alexandria Ocasio-Cortez', party: 'D', electionYear: 2024, margin: '+58.7%' },
  'NY-15': { name: 'Ritchie Torres', party: 'D', electionYear: 2024, margin: '72.1%' },
  'NY-16': { name: 'Jamaal Bowman', party: 'D', electionYear: 2024, margin: '+54.2%' },
  'NY-17': { name: 'Mike Lawler', party: 'R', electionYear: 2024, margin: '+4.6%' },
  'NY-18': { name: 'Pat Ryan', party: 'D', electionYear: 2024, margin: '+6.8%' },
  'NY-19': { name: 'Marcus Molinaro', party: 'R', electionYear: 2024, margin: '+8.2%' },
  'NY-20': { name: 'Paul Tonko', party: 'D', electionYear: 2024, margin: '+34.6%' },
  'NY-21': { name: 'Elise Stefanik', party: 'R', electionYear: 2024, margin: '+38.4%' },
  'NY-22': { name: 'Brandon Williams', party: 'R', electionYear: 2024, margin: '+5.4%' },
  'NY-23': { name: 'Nick Langworthy', party: 'R', electionYear: 2024, margin: '+22.8%' },
  'NY-24': { name: 'Claudia Tenney', party: 'R', electionYear: 2024, margin: '+12.6%' },
  'NY-25': { name: 'Joe Morelle', party: 'D', electionYear: 2024, margin: '+28.4%' },
  'NY-26': { name: 'Tim Kennedy', party: 'D', electionYear: 2024, margin: '+36.8%' },

  // North Carolina
  'NC-1': { name: 'Don Davis', party: 'D', electionYear: 2024, margin: '+18.6%' },
  'NC-2': { name: 'Deborah Ross', party: 'D', electionYear: 2024, margin: '+14.2%' },
  'NC-3': { name: 'Greg Murphy', party: 'R', electionYear: 2024, margin: '+32.4%' },
  'NC-4': { name: 'Valerie Foushee', party: 'D', electionYear: 2024, margin: '+38.7%' },
  'NC-5': { name: 'Virginia Foxx', party: 'R', electionYear: 2024, margin: '+28.9%' },
  'NC-6': { name: 'Kathy Manning', party: 'D', electionYear: 2024, margin: '+8.4%' },
  'NC-7': { name: 'David Rouzer', party: 'R', electionYear: 2024, margin: '+24.6%' },
  'NC-8': { name: 'Dan Bishop', party: 'R', electionYear: 2024, margin: '+22.8%' },
  'NC-9': { name: 'Richard Hudson', party: 'R', electionYear: 2024, margin: '+18.3%' },
  'NC-10': { name: 'Patrick McHenry', party: 'R', electionYear: 2024, margin: '+26.7%' },
  'NC-11': { name: 'Chuck Edwards', party: 'R', electionYear: 2024, margin: '+16.9%' },
  'NC-12': { name: 'Alma Adams', party: 'D', electionYear: 2024, margin: '+44.8%' },
  'NC-13': { name: 'Wiley Nickel', party: 'D', electionYear: 2024, margin: '+6.2%' },
  'NC-14': { name: 'Jeff Jackson', party: 'D', electionYear: 2024, margin: '+12.4%' },

  // North Dakota
  'ND-AL': { name: 'Kelly Armstrong', party: 'R', electionYear: 2024, margin: '+48.6%' },

  // Ohio
  'OH-1': { name: 'Greg Landsman', party: 'D', electionYear: 2024, margin: '+5.8%' },
  'OH-2': { name: 'Brad Wenstrup', party: 'R', electionYear: 2024, margin: '+32.4%' },
  'OH-3': { name: 'Joyce Beatty', party: 'D', electionYear: 2024, margin: '+52.6%' },
  'OH-4': { name: 'Jim Jordan', party: 'R', electionYear: 2024, margin: '+38.7%' },
  'OH-5': { name: 'Bob Latta', party: 'R', electionYear: 2024, margin: '+36.2%' },
  'OH-6': { name: 'Michael Rulli', party: 'R', electionYear: 2024, margin: '+28.9%' },
  'OH-7': { name: 'Max Miller', party: 'R', electionYear: 2024, margin: '+18.4%' },
  'OH-8': { name: 'Warren Davidson', party: 'R', electionYear: 2024, margin: '+42.8%' },
  'OH-9': { name: 'Marcy Kaptur', party: 'D', electionYear: 2024, margin: '+3.2%' },
  'OH-10': { name: 'Mike Turner', party: 'R', electionYear: 2024, margin: '+24.6%' },
  'OH-11': { name: 'Shontel Brown', party: 'D', electionYear: 2024, margin: '+58.3%' },
  'OH-12': { name: 'Troy Balderson', party: 'R', electionYear: 2024, margin: '+22.7%' },
  'OH-13': { name: 'Emilia Sykes', party: 'D', electionYear: 2024, margin: '+4.8%' },
  'OH-14': { name: 'David Joyce', party: 'R', electionYear: 2024, margin: '+26.4%' },
  'OH-15': { name: 'Mike Carey', party: 'R', electionYear: 2024, margin: '+16.8%' },

  // Oklahoma
  'OK-1': { name: 'Kevin Hern', party: 'R', electionYear: 2024, margin: '+38.6%' },
  'OK-2': { name: 'Josh Brecheen', party: 'R', electionYear: 2024, margin: '+42.3%' },
  'OK-3': { name: 'Frank Lucas', party: 'R', electionYear: 2024, margin: '+52.8%' },
  'OK-4': { name: 'Tom Cole', party: 'R', electionYear: 2024, margin: '+44.7%' },
  'OK-5': { name: 'Stephanie Bice', party: 'R', electionYear: 2024, margin: '+18.4%' },

  // Oregon
  'OR-1': { name: 'Suzanne Bonamici', party: 'D', electionYear: 2024, margin: '+28.6%' },
  'OR-2': { name: 'Cliff Bentz', party: 'R', electionYear: 2024, margin: '+34.8%' },
  'OR-3': { name: 'Earl Blumenauer', party: 'D', electionYear: 2024, margin: '+54.2%' },
  'OR-4': { name: 'Val Hoyle', party: 'D', electionYear: 2024, margin: '+8.7%' },
  'OR-5': { name: 'Lori Chavez-DeRemer', party: 'R', electionYear: 2024, margin: '+4.2%' },
  'OR-6': { name: 'Andrea Salinas', party: 'D', electionYear: 2024, margin: '+6.8%' },

  // Pennsylvania
  'PA-1': { name: 'Brian Fitzpatrick', party: 'R', electionYear: 2024, margin: '+12.4%' },
  'PA-2': { name: 'Brendan Boyle', party: 'D', electionYear: 2024, margin: '+58.9%' },
  'PA-3': { name: 'Dwight Evans', party: 'D', electionYear: 2024, margin: '+68.2%' },
  'PA-4': { name: 'Madeleine Dean', party: 'D', electionYear: 2024, margin: '+34.6%' },
  'PA-5': { name: 'Mary Gay Scanlon', party: 'D', electionYear: 2024, margin: '+32.8%' },
  'PA-6': { name: 'Chrissy Houlahan', party: 'D', electionYear: 2024, margin: '+18.7%' },
  'PA-7': { name: 'Susan Wild', party: 'D', electionYear: 2024, margin: '+4.8%' },
  'PA-8': { name: 'Matt Cartwright', party: 'D', electionYear: 2024, margin: '+2.6%' },
  'PA-9': { name: 'Dan Meuser', party: 'R', electionYear: 2024, margin: '+32.4%' },
  'PA-10': { name: 'Scott Perry', party: 'R', electionYear: 2024, margin: '+8.3%' },
  'PA-11': { name: 'Lloyd Smucker', party: 'R', electionYear: 2024, margin: '+22.6%' },
  'PA-12': { name: 'Summer Lee', party: 'D', electionYear: 2024, margin: '+38.4%' },
  'PA-13': { name: 'John Joyce', party: 'R', electionYear: 2024, margin: '+44.8%' },
  'PA-14': { name: 'Guy Reschenthaler', party: 'R', electionYear: 2024, margin: '+28.7%' },
  'PA-15': { name: 'Glenn Thompson', party: 'R', electionYear: 2024, margin: '+36.9%' },
  'PA-16': { name: 'Mike Kelly', party: 'R', electionYear: 2024, margin: '+26.3%' },
  'PA-17': { name: 'Chris Deluzio', party: 'D', electionYear: 2024, margin: '+14.2%' },

  // Rhode Island
  'RI-1': { name: 'Gabe Amo', party: 'D', electionYear: 2024, margin: '+38.6%' },
  'RI-2': { name: 'Seth Magaziner', party: 'D', electionYear: 2024, margin: '+24.8%' },

  // South Carolina
  'SC-1': { name: 'Nancy Mace', party: 'R', electionYear: 2024, margin: '+14.7%' },
  'SC-2': { name: 'Joe Wilson', party: 'R', electionYear: 2024, margin: '+22.4%' },
  'SC-3': { name: 'Jeff Duncan', party: 'R', electionYear: 2024, margin: '+38.6%' },
  'SC-4': { name: 'William Timmons', party: 'R', electionYear: 2024, margin: '+28.9%' },
  'SC-5': { name: 'Ralph Norman', party: 'R', electionYear: 2024, margin: '+32.7%' },
  'SC-6': { name: 'Jim Clyburn', party: 'D', electionYear: 2024, margin: '+42.8%' },
  'SC-7': { name: 'Russell Fry', party: 'R', electionYear: 2024, margin: '+24.6%' },

  // South Dakota
  'SD-AL': { name: 'Dusty Johnson', party: 'R', electionYear: 2024, margin: '+44.2%' },

  // Tennessee
  'TN-1': { name: 'Diana Harshbarger', party: 'R', electionYear: 2024, margin: '+48.9%' },
  'TN-2': { name: 'Tim Burchett', party: 'R', electionYear: 2024, margin: '+36.4%' },
  'TN-3': { name: 'Chuck Fleischmann', party: 'R', electionYear: 2024, margin: '+42.7%' },
  'TN-4': { name: 'Scott DesJarlais', party: 'R', electionYear: 2024, margin: '44.8%' },
  'TN-5': { name: 'Andy Ogles', party: 'R', electionYear: 2024, margin: '+18.2%' },
  'TN-6': { name: 'John Rose', party: 'R', electionYear: 2024, margin: '+52.6%' },
  'TN-7': { name: 'Mark Green', party: 'R', electionYear: 2024, margin: '+38.4%' },
  'TN-8': { name: 'David Kustoff', party: 'R', electionYear: 2024, margin: '+46.3%' },
  'TN-9': { name: 'Steve Cohen', party: 'D', electionYear: 2024, margin: '+58.7%' },

  // Texas
  'TX-1': { name: 'Nathaniel Moran', party: 'R', electionYear: 2024, margin: '+42.8%' },
  'TX-2': { name: 'Dan Crenshaw', party: 'R', electionYear: 2024, margin: '+24.6%' },
  'TX-3': { name: 'Keith Self', party: 'R', electionYear: 2024, margin: '+18.7%' },
  'TX-4': { name: 'Pat Fallon', party: 'R', electionYear: 2024, margin: '+48.2%' },
  'TX-5': { name: 'Lance Gooden', party: 'R', electionYear: 2024, margin: '+32.4%' },
  'TX-6': { name: 'Jake Ellzey', party: 'R', electionYear: 2024, margin: '+16.8%' },
  'TX-7': { name: 'Lizzie Fletcher', party: 'D', electionYear: 2024, margin: '+8.4%' },
  'TX-8': { name: 'Morgan Luttrell', party: 'R', electionYear: 2024, margin: '+36.9%' },
  'TX-9': { name: 'Al Green', party: 'D', electionYear: 2024, margin: '+52.3%' },
  'TX-10': { name: 'Michael McCaul', party: 'R', electionYear: 2024, margin: '+12.6%' },
  'TX-11': { name: 'August Pfluger', party: 'R', electionYear: 2024, margin: '+54.7%' },
  'TX-12': { name: 'Kay Granger', party: 'R', electionYear: 2024, margin: '+28.3%' },
  'TX-13': { name: 'Ronny Jackson', party: 'R', electionYear: 2024, margin: '+62.4%' },
  'TX-14': { name: 'Randy Weber', party: 'R', electionYear: 2024, margin: '+34.8%' },
  'TX-15': { name: 'Monica De La Cruz', party: 'R', electionYear: 2024, margin: '+14.2%' },
  'TX-16': { name: 'Veronica Escobar', party: 'D', electionYear: 2024, margin: '+38.6%' },
  'TX-17': { name: 'Pete Sessions', party: 'R', electionYear: 2024, margin: '+22.7%' },
  'TX-18': { name: 'Sheila Jackson Lee', party: 'D', electionYear: 2024, margin: '+58.9%' },
  'TX-19': { name: 'Jodey Arrington', party: 'R', electionYear: 2024, margin: '+46.8%' },
  'TX-20': { name: 'Joaquin Castro', party: 'D', electionYear: 2024, margin: '+42.3%' },
  'TX-21': { name: 'Chip Roy', party: 'R', electionYear: 2024, margin: '+18.4%' },
  'TX-22': { name: 'Troy Nehls', party: 'R', electionYear: 2024, margin: '+24.9%' },
  'TX-23': { name: 'Tony Gonzales', party: 'R', electionYear: 2024, margin: '+8.7%' },
  'TX-24': { name: 'Beth Van Duyne', party: 'R', electionYear: 2024, margin: '+12.3%' },
  'TX-25': { name: 'Roger Williams', party: 'R', electionYear: 2024, margin: '+26.8%' },
  'TX-26': { name: 'Michael Burgess', party: 'R', electionYear: 2024, margin: '+32.6%' },
  'TX-27': { name: 'Michael Cloud', party: 'R', electionYear: 2024, margin: '+36.4%' },
  'TX-28': { name: 'Henry Cuellar', party: 'D', electionYear: 2024, margin: '+14.6%' },
  'TX-29': { name: 'Sylvia Garcia', party: 'D', electionYear: 2024, margin: '+48.2%' },
  'TX-30': { name: 'Jasmine Crockett', party: 'D', electionYear: 2024, margin: '+64.7%' },
  'TX-31': { name: 'John Carter', party: 'R', electionYear: 2024, margin: '+16.9%' },
  'TX-32': { name: 'Colin Allred', party: 'D', electionYear: 2024, margin: '+18.3%' },
  'TX-33': { name: 'Marc Veasey', party: 'D', electionYear: 2024, margin: '+52.8%' },
  'TX-34': { name: 'Vicente Gonzalez', party: 'D', electionYear: 2024, margin: '+24.7%' },
  'TX-35': { name: 'Greg Casar', party: 'D', electionYear: 2024, margin: '+44.2%' },
  'TX-36': { name: 'Brian Babin', party: 'R', electionYear: 2024, margin: '+48.6%' },
  'TX-37': { name: 'Lloyd Doggett', party: 'D', electionYear: 2024, margin: '+38.9%' },
  'TX-38': { name: 'Wesley Hunt', party: 'R', electionYear: 2024, margin: '+22.4%' },

  // Utah
  'UT-1': { name: 'Blake Moore', party: 'R', electionYear: 2024, margin: '+34.6%' },
  'UT-2': { name: 'Celeste Maloy', party: 'R', electionYear: 2024, margin: '+28.9%' },
  'UT-3': { name: 'John Curtis', party: 'R', electionYear: 2024, margin: '+38.2%' },
  'UT-4': { name: 'Burgess Owens', party: 'R', electionYear: 2024, margin: '+12.7%' },

  // Vermont
  'VT-AL': { name: 'Becca Balint', party: 'D', electionYear: 2024, margin: '+48.6%' },

  // Virginia
  'VA-1': { name: 'Rob Wittman', party: 'R', electionYear: 2024, margin: '+24.8%' },
  'VA-2': { name: 'Jen Kiggans', party: 'R', electionYear: 2024, margin: '+8.4%' },
  'VA-3': { name: 'Bobby Scott', party: 'D', electionYear: 2024, margin: '+48.2%' },
  'VA-4': { name: 'Jennifer McClellan', party: 'D', electionYear: 2024, margin: '+38.6%' },
  'VA-5': { name: 'Bob Good', party: 'R', electionYear: 2024, margin: '+18.7%' },
  'VA-6': { name: 'Ben Cline', party: 'R', electionYear: 2024, margin: '+32.4%' },
  'VA-7': { name: 'Eugene Vindman', party: 'D', electionYear: 2024, margin: '+6.8%' },
  'VA-8': { name: 'Don Beyer', party: 'D', electionYear: 2024, margin: '+54.3%' },
  'VA-9': { name: 'Morgan Griffith', party: 'R', electionYear: 2024, margin: '+42.6%' },
  'VA-10': { name: 'Suhas Subramanyam', party: 'D', electionYear: 2024, margin: '+12.4%' },
  'VA-11': { name: 'Gerry Connolly', party: 'D', electionYear: 2024, margin: '+36.9%' },

  // Washington
  'WA-1': { name: 'Suzan DelBene', party: 'D', electionYear: 2024, margin: '+28.4%' },
  'WA-2': { name: 'Rick Larsen', party: 'D', electionYear: 2024, margin: '+24.6%' },
  'WA-3': { name: 'Marie Gluesenkamp Perez', party: 'D', electionYear: 2024, margin: '+4.2%' },
  'WA-4': { name: 'Dan Newhouse', party: 'R', electionYear: 2024, margin: '+18.8%' },
  'WA-5': { name: 'Cathy McMorris Rodgers', party: 'R', electionYear: 2024, margin: '+26.7%' },
  'WA-6': { name: 'Derek Kilmer', party: 'D', electionYear: 2024, margin: '+32.8%' },
  'WA-7': { name: 'Pramila Jayapal', party: 'D', electionYear: 2024, margin: '+62.4%' },
  'WA-8': { name: 'Kim Schrier', party: 'D', electionYear: 2024, margin: '+8.6%' },
  'WA-9': { name: 'Adam Smith', party: 'D', electionYear: 2024, margin: '+38.2%' },
  'WA-10': { name: 'Marilyn Strickland', party: 'D', electionYear: 2024, margin: '+34.7%' },

  // West Virginia
  'WV-1': { name: 'Carol Miller', party: 'R', electionYear: 2024, margin: '+44.8%' },
  'WV-2': { name: 'Alex Mooney', party: 'R', electionYear: 2024, margin: '+38.6%' },

  // Wisconsin
  'WI-1': { name: 'Bryan Steil', party: 'R', electionYear: 2024, margin: '+18.4%' },
  'WI-2': { name: 'Mark Pocan', party: 'D', electionYear: 2024, margin: '+48.9%' },
  'WI-3': { name: 'Derrick Van Orden', party: 'R', electionYear: 2024, margin: '+6.8%' },
  'WI-4': { name: 'Gwen Moore', party: 'D', electionYear: 2024, margin: '+58.3%' },
  'WI-5': { name: 'Scott Fitzgerald', party: 'R', electionYear: 2024, margin: '+32.6%' },
  'WI-6': { name: 'Glenn Grothman', party: 'R', electionYear: 2024, margin: '+24.8%' },
  'WI-7': { name: 'Tom Tiffany', party: 'R', electionYear: 2024, margin: '+36.4%' },
  'WI-8': { name: 'Tony Wied', party: 'R', electionYear: 2024, margin: '+8.2%' },

  // Wyoming
  'WY-AL': { name: 'Harriet Hageman', party: 'R', electionYear: 2024, margin: '+54.8%' },

  // Washington DC
  'DC-1': { name: 'Eleanor Holmes Norton', party: 'D', electionYear: 2024, margin: '+82.4%' }
};

// Helper function to get party class
function getPartyClass(party) {
  if (party === 'D') return 'party-dem';
  if (party === 'R') return 'party-rep';
  if (party === 'I') return 'party-ind';
  if (party === 'Vacant') return 'party-vacant';
  return '';
}

// Helper function to get party full name
function getPartyFullName(party) {
  if (party === 'D') return 'Democrat';
  if (party === 'R') return 'Republican';
  if (party === 'I') return 'Independent';
  if (party === 'Vacant') return 'Vacant';
  return party;
}

// Helper function to format district ID from SVG format
// Handles formats: "LA__2", "LA02", "AK__0" (At-Large), "AK__AL"
function formatDistrictId(svgId) {
  if (!svgId || svgId.length < 3) return svgId;

  // Support both "LA__2" and legacy "LA02"
  let stateCode = svgId.substring(0, 2);
  let districtPart = "";

  // New format (with "__")
  if (svgId.includes("__")) {
    districtPart = svgId.split("__")[1];
  } else {
    // Legacy numeric format
    districtPart = svgId.substring(2);
  }

  // Normalize districtPart
  districtPart = districtPart.trim().toUpperCase();

  // Handle At-Large districts:
  // - Either explicitly marked "__AL"
  // - Or "__0" or "0"
  const atLargeStates = ["AK", "VT", "ND", "SD", "DE", "WY"];

  if (districtPart === "AL" || districtPart === "0" || atLargeStates.includes(stateCode)) {
    return `${stateCode}-AL`;
  }

  // Convert district numbers (remove leading zeros)
  const formattedNum = parseInt(districtPart, 10);
  if (isNaN(formattedNum)) return `${stateCode}-${districtPart}`; // fallback

  return `${stateCode}-${formattedNum}`;
}


// Helper function to get state name from code
function getStateName(stateCode) {
  const stateNames = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'District of Columbia'
  };
  return stateNames[stateCode] || stateCode;
}


// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { houseMembers, getPartyClass, getPartyFullName, formatDistrictId, getStateName };
}