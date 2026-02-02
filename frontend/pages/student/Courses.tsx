import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Api } from '../../services/api';
import { 
  BookOpen, Play, FileText, Clock, Users, Star, Search,
  Award, Bookmark, BookmarkCheck, ExternalLink,
  Video, File, Link as LinkIcon, TrendingUp,
  Code, BarChart3, Database, Globe, Cpu, Palette, Youtube
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  lessons: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnail: string;
  youtubeUrl: string;
  youtubePlaylist?: string;
  rating: number;
  students: number;
  isFree: boolean;
  tags: string[];
  status?: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'article' | 'link';
  category: string;
  duration?: string;
  size?: string;
  url: string;
  isNew?: boolean;
}

const categories = [
  { name: 'All', icon: BookOpen, color: 'bg-slate-500' },
  { name: 'Web Development', icon: Globe, color: 'bg-blue-500' },
  { name: 'Programming', icon: Code, color: 'bg-green-500' },
  { name: 'AI/ML', icon: Cpu, color: 'bg-purple-500' },
  { name: 'Design', icon: Palette, color: 'bg-pink-500' },
  { name: 'Database', icon: Database, color: 'bg-cyan-500' },
  { name: 'System Design', icon: BarChart3, color: 'bg-orange-500' },
];

export const Courses: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'courses' | 'resources' | 'my-learning'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarkedCourses');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('bookmarkedCourses', JSON.stringify(bookmarkedCourses));
  }, [bookmarkedCourses]);

  const loadData = async () => {
    try {
      const [coursesData, resourcesData] = await Promise.all([
        Api.getCourses(),
        Api.getResources()
      ]);
      setCourses(coursesData.filter((c: Course) => c.status !== 'Draft' && c.status !== 'Archived'));
      setResources(resourcesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bookmarkedCoursesList = courses.filter(c => bookmarkedCourses.includes(c.id));

  const toggleBookmark = (courseId: string) => {
    setBookmarkedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video size={16} className="text-red-500" />;
      case 'pdf': return <FileText size={16} className="text-red-600" />;
      case 'article': return <File size={16} className="text-blue-500" />;
      case 'link': return <LinkIcon size={16} className="text-green-500" />;
      default: return <File size={16} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-amber-100 text-amber-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const openCourse = (course: Course) => {
    const url = course.youtubePlaylist || course.youtubeUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-1">
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-violet-900/50 to-purple-900/50' : 'bg-gradient-to-r from-violet-600 to-purple-600'} rounded-2xl p-5 md:p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 md:gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <BookOpen size={20} className="md:w-6 md:h-6" />
            </div>
            <h1 className="text-xl md:text-3xl font-bold">Learning Hub</h1>
          </div>
          <p className="text-purple-100 text-sm md:text-base max-w-2xl">
            Free YouTube courses, tutorials, and resources
          </p>
          
          <div className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 md:p-2 bg-white/20 rounded-lg">
                <Youtube size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold">{courses.length}+</p>
                <p className="text-[10px] md:text-xs text-purple-200">Free Courses</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 md:p-2 bg-white/20 rounded-lg">
                <FileText size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold">{resources.length}+</p>
                <p className="text-[10px] md:text-xs text-purple-200">Resources</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 md:p-2 bg-white/20 rounded-lg">
                <Award size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold">100%</p>
                <p className="text-[10px] md:text-xs text-purple-200">Free Access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 md:gap-2 p-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl overflow-x-auto`}>
        {[
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'resources', label: 'Resources', icon: FileText },
          { id: 'my-learning', label: 'Saved', icon: Bookmark },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-lg'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon size={14} className="md:w-4 md:h-4" />
            {tab.label}
            {tab.id === 'my-learning' && bookmarkedCourses.length > 0 && (
              <span className="ml-0.5 md:ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px] md:text-xs">
                {bookmarkedCourses.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-3 md:p-4`}>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
              } focus:outline-none focus:ring-2 focus:ring-violet-500`}
            />
          </div>
          
          {activeTab === 'courses' && (
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className={`px-3 md:px-4 py-2.5 rounded-xl border text-sm ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              } focus:outline-none focus:ring-2 focus:ring-violet-500`}
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          )}
        </div>
        
        {activeTab === 'courses' && (
          <div className="flex gap-1.5 md:gap-2 mt-3 md:mt-4 overflow-x-auto pb-2 -mx-1 px-1">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-violet-600 text-white'
                    : isDark 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <cat.icon size={12} className="md:w-3.5 md:h-3.5" />
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCourses.length === 0 ? (
            <div className={`col-span-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-8 md:p-12 text-center`}>
              <BookOpen className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} size={40} />
              <p className={`text-sm md:text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No courses found</p>
            </div>
          ) : (
            filteredCourses.map(course => (
              <div 
                key={course.id}
                className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl border overflow-hidden hover:shadow-xl transition-all group`}
              >
                <div 
                  className="relative h-36 md:h-40 overflow-hidden cursor-pointer"
                  onClick={() => openCourse(course)}
                >
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Course'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <Play size={32} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                  
                  <div className="absolute top-3 left-3 flex gap-2">
                    {course.isFree && (
                      <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">FREE</span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(course.id); }}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    {bookmarkedCourses.includes(course.id)
                      ? <BookmarkCheck size={16} className="text-indigo-600" />
                      : <Bookmark size={16} className="text-slate-600" />
                    }
                  </button>

                  <div className="absolute bottom-3 right-3">
                    <div className="px-2 py-1 bg-red-600 rounded flex items-center gap-1">
                      <Youtube size={12} className="text-white" />
                      <span className="text-white text-xs font-medium">YouTube</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex gap-2 mb-2">
                    {course.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 
                    className={`font-semibold mb-1 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
                    onClick={() => openCourse(course)}
                  >
                    {course.title}
                  </h3>
                  <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {course.description}
                  </p>
                  
                  <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    by <span className="font-medium">{course.instructor}</span>
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {course.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span className={isDark ? 'text-white' : 'text-slate-700'}>{course.rating}</span>
                        </span>
                      )}
                      {course.students > 0 && (
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                          {course.students.toLocaleString()} students
                        </span>
                      )}
                    </div>
                    <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Clock size={12} />
                      {course.duration}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => openCourse(course)}
                    className="w-full mt-4 py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={16} fill="white" />
                    Watch on YouTube
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Resources */}
      {activeTab === 'resources' && (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredResources.length === 0 ? (
            <div className={`col-span-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-12 text-center`}>
              <FileText className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} size={48} />
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No resources found</p>
            </div>
          ) : (
            filteredResources.map(resource => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'} rounded-xl border p-4 flex items-center gap-4 transition-all group`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  resource.type === 'video' ? 'bg-red-100' :
                  resource.type === 'pdf' ? 'bg-orange-100' :
                  resource.type === 'article' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {resource.title}
                    </h3>
                    {resource.isNew && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">NEW</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-3 text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="capitalize">{resource.type}</span>
                    {resource.duration && <span>• {resource.duration}</span>}
                    <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      {resource.category}
                    </span>
                  </div>
                </div>
                <ExternalLink size={18} className={`${isDark ? 'text-slate-500' : 'text-slate-400'} group-hover:text-indigo-600 transition-colors`} />
              </a>
            ))
          )}
        </div>
      )}

      {/* Bookmarked */}
      {activeTab === 'my-learning' && (
        <div className="space-y-6">
          {bookmarkedCoursesList.length === 0 ? (
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-12 text-center`}>
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Bookmark size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                No bookmarked courses
              </h3>
              <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Bookmark courses to easily find them later!
              </p>
              <button 
                onClick={() => setActiveTab('courses')}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {bookmarkedCoursesList.map(course => (
                <div 
                  key={course.id}
                  className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-4 flex gap-4`}
                >
                  <img 
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer"
                    onClick={() => openCourse(course)}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=Course'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 
                      className={`font-medium mb-1 truncate cursor-pointer hover:text-indigo-600 ${isDark ? 'text-white' : 'text-slate-800'}`}
                      onClick={() => openCourse(course)}
                    >
                      {course.title}
                    </h3>
                    <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {course.instructor} • {course.duration}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleBookmark(course.id)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Remove bookmark"
                        >
                          <BookmarkCheck size={16} className="text-indigo-600" />
                        </button>
                        <button 
                          onClick={() => openCourse(course)}
                          className="text-xs text-red-600 font-medium hover:underline flex items-center gap-1"
                        >
                          <Play size={12} fill="currentColor" /> Watch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
