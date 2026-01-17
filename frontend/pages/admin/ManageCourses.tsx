import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Api } from '../../services/api';
import { useConfirmDialog, ConfirmDialog } from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  BookOpen, Plus, Search, Edit2, Trash2, ExternalLink, Video, FileText,
  Link as LinkIcon, X, Save, Youtube, Clock, Users, Star, Filter,
  Eye, EyeOff, ChevronDown
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
  status: 'Active' | 'Draft' | 'Archived';
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

const categories = ['Web Development', 'Programming', 'AI/ML', 'Design', 'Database', 'System Design', 'DevOps', 'Mobile Development'];
const resourceCategories = ['Career', 'Interview', 'DSA', 'Tools', 'Programming', 'Soft Skills'];

export const ManageCourses: React.FC = () => {
  const { isDark } = useTheme();
  const { dialogProps, confirm } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<'courses' | 'resources'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Course | Resource | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    lessons: 0,
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    category: 'Web Development',
    thumbnail: '',
    youtubeUrl: '',
    youtubePlaylist: '',
    isFree: true,
    tags: '',
    status: 'Active' as 'Active' | 'Draft' | 'Archived'
  });

  // Resource form state
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'video' as 'video' | 'pdf' | 'article' | 'link',
    category: 'Career',
    duration: '',
    url: '',
    isNew: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [coursesData, resourcesData] = await Promise.all([
      Api.getCourses(),
      Api.getResources()
    ]);
    setCourses(coursesData);
    setResources(resourcesData);
  };

  const extractYoutubeThumbnail = (url: string): string => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
    }
    return '';
  };

  const handleYoutubeUrlChange = (url: string) => {
    setCourseForm(prev => ({
      ...prev,
      youtubeUrl: url,
      thumbnail: prev.thumbnail || extractYoutubeThumbnail(url)
    }));
  };

  const resetForms = () => {
    setCourseForm({
      title: '', description: '', instructor: '', duration: '', lessons: 0,
      level: 'Beginner', category: 'Web Development', thumbnail: '', youtubeUrl: '',
      youtubePlaylist: '', isFree: true, tags: '', status: 'Active'
    });
    setResourceForm({
      title: '', type: 'video', category: 'Career', duration: '', url: '', isNew: true
    });
    setEditingItem(null);
    setIsEditing(false);
  };

  const openAddModal = () => {
    resetForms();
    setShowModal(true);
  };

  const openEditModal = (item: Course | Resource) => {
    setEditingItem(item);
    setIsEditing(true);
    
    if (activeTab === 'courses') {
      const course = item as Course;
      setCourseForm({
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        duration: course.duration,
        lessons: course.lessons,
        level: course.level,
        category: course.category,
        thumbnail: course.thumbnail,
        youtubeUrl: course.youtubeUrl,
        youtubePlaylist: course.youtubePlaylist || '',
        isFree: course.isFree,
        tags: Array.isArray(course.tags) ? course.tags.join(', ') : course.tags,
        status: course.status || 'Active'
      });
    } else {
      const resource = item as Resource;
      setResourceForm({
        title: resource.title,
        type: resource.type,
        category: resource.category,
        duration: resource.duration || '',
        url: resource.url,
        isNew: resource.isNew ?? false
      });
    }
    setShowModal(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.youtubeUrl) {
      toast.error('Please fill in required fields (Title and YouTube URL)');
      return;
    }

    try {
      const courseData = {
        ...courseForm,
        thumbnail: courseForm.thumbnail || extractYoutubeThumbnail(courseForm.youtubeUrl)
      };

      if (isEditing && editingItem) {
        await Api.updateCourse(editingItem.id, courseData);
        toast.success('Course updated successfully!');
      } else {
        await Api.postCourse(courseData);
        toast.success('Course added successfully!');
      }
      
      await loadData();
      setShowModal(false);
      resetForms();
    } catch (error) {
      toast.error('Failed to save course');
    }
  };

  const handleSaveResource = async () => {
    if (!resourceForm.title || !resourceForm.url) {
      toast.error('Please fill in required fields (Title and URL)');
      return;
    }

    try {
      if (isEditing && editingItem) {
        await Api.updateResource(editingItem.id, resourceForm);
        toast.success('Resource updated successfully!');
      } else {
        await Api.postResource(resourceForm);
        toast.success('Resource added successfully!');
      }
      
      await loadData();
      setShowModal(false);
      resetForms();
    } catch (error) {
      toast.error('Failed to save resource');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        await Api.deleteCourse(id);
        toast.success('Course deleted successfully');
        await loadData();
      } catch (error) {
        toast.error('Failed to delete course');
      }
    }
  };

  const handleDeleteResource = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Resource',
      message: 'Are you sure you want to delete this resource?',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        await Api.deleteResource(id);
        toast.success('Resource deleted successfully');
        await loadData();
      } catch (error) {
        toast.error('Failed to delete resource');
      }
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={16} className="text-red-500" />;
      case 'pdf': return <FileText size={16} className="text-orange-500" />;
      case 'article': return <FileText size={16} className="text-blue-500" />;
      case 'link': return <LinkIcon size={16} className="text-green-500" />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog {...dialogProps} />

      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-emerald-900/50 to-teal-900/50' : 'bg-gradient-to-r from-emerald-500 to-teal-600'} rounded-2xl p-6 text-white`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Manage Learning Hub</h1>
              <p className="text-emerald-100">Add and manage courses, videos, and resources for students</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
          >
            <Plus size={18} />
            {activeTab === 'courses' ? 'Add Course' : 'Add Resource'}
          </button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-4`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Tabs */}
          <div className={`flex gap-2 p-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-xl`}>
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'courses'
                  ? 'bg-emerald-600 text-white shadow'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Youtube size={16} />
              Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'resources'
                  ? 'bg-emerald-600 text-white shadow'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={16} />
              Resources ({resources.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            />
          </div>
        </div>
      </div>

      {/* Courses Table */}
      {activeTab === 'courses' && (
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Course</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Level</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <BookOpen className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} size={40} />
                      <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No courses found</p>
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x90?text=No+Image'; }}
                          />
                          <div className="min-w-0">
                            <h3 className={`font-medium truncate max-w-xs ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {course.title}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {course.instructor} • {course.duration}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {course.category}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                          course.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {course.level}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          course.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                          course.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {course.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={course.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}
                            title="Open Video"
                          >
                            <ExternalLink size={16} className="text-red-500" />
                          </a>
                          <button
                            onClick={() => openEditModal(course)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}
                            title="Edit"
                          >
                            <Edit2 size={16} className="text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resources Table */}
      {activeTab === 'resources' && (
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-slate-700/50' : 'bg-slate-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Resource</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Type</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>New</th>
                  <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <FileText className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} size={40} />
                      <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No resources found</p>
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((resource) => (
                    <tr key={resource.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            resource.type === 'video' ? 'bg-red-100' :
                            resource.type === 'pdf' ? 'bg-orange-100' :
                            resource.type === 'article' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {getResourceIcon(resource.type)}
                          </div>
                          <div>
                            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {resource.title}
                            </h3>
                            {resource.duration && (
                              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {resource.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-4 capitalize ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {resource.type}
                      </td>
                      <td className={`px-4 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {resource.category}
                      </td>
                      <td className="px-4 py-4">
                        {resource.isNew ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">NEW</span>
                        ) : (
                          <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}
                            title="Open"
                          >
                            <ExternalLink size={16} className="text-indigo-500" />
                          </a>
                          <button
                            onClick={() => openEditModal(resource)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}
                            title="Edit"
                          >
                            <Edit2 size={16} className="text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(resource.id)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className={`sticky top-0 px-6 py-4 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} flex items-center justify-between rounded-t-2xl`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {isEditing ? 'Edit' : 'Add'} {activeTab === 'courses' ? 'Course' : 'Resource'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForms(); }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {activeTab === 'courses' ? (
                <>
                  {/* Course Form */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="e.g., React JS Full Course 2024"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      YouTube Video URL *
                    </label>
                    <div className="relative">
                      <Youtube size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                      <input
                        type="url"
                        value={courseForm.youtubeUrl}
                        onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      YouTube Playlist URL (optional)
                    </label>
                    <input
                      type="url"
                      value={courseForm.youtubePlaylist}
                      onChange={(e) => setCourseForm({ ...courseForm, youtubePlaylist: e.target.value })}
                      placeholder="https://www.youtube.com/playlist?list=..."
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      placeholder="Brief description of the course"
                      className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Instructor
                      </label>
                      <input
                        type="text"
                        value={courseForm.instructor}
                        onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                        placeholder="e.g., Striver"
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Duration
                      </label>
                      <input
                        type="text"
                        value={courseForm.duration}
                        onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                        placeholder="e.g., 45 hours"
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Category
                      </label>
                      <select
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Level
                      </label>
                      <select
                        value={courseForm.level}
                        onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Number of Lessons
                      </label>
                      <input
                        type="number"
                        value={courseForm.lessons}
                        onChange={(e) => setCourseForm({ ...courseForm, lessons: parseInt(e.target.value) || 0 })}
                        placeholder="e.g., 50"
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Status
                      </label>
                      <select
                        value={courseForm.status}
                        onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={courseForm.tags}
                      onChange={(e) => setCourseForm({ ...courseForm, tags: e.target.value })}
                      placeholder="e.g., React, JavaScript, Frontend, Web Dev"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Custom Thumbnail URL (optional - auto-filled from YouTube)
                    </label>
                    <input
                      type="url"
                      value={courseForm.thumbnail}
                      onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                      placeholder="Leave empty to use YouTube thumbnail"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={courseForm.isFree}
                      onChange={(e) => setCourseForm({ ...courseForm, isFree: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="isFree" className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      This is a free course
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {/* Resource Form */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                      placeholder="e.g., Resume Building Guide 2025"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      URL *
                    </label>
                    <input
                      type="url"
                      value={resourceForm.url}
                      onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                      placeholder="https://..."
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Type
                      </label>
                      <select
                        value={resourceForm.type}
                        onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as any })}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="article">Article</option>
                        <option value="link">Link</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Category
                      </label>
                      <select
                        value={resourceForm.category}
                        onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      >
                        {resourceCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(resourceForm.type === 'video') && (
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Duration
                      </label>
                      <input
                        type="text"
                        value={resourceForm.duration}
                        onChange={(e) => setResourceForm({ ...resourceForm, duration: e.target.value })}
                        placeholder="e.g., 30 min"
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={resourceForm.isNew}
                      onChange={(e) => setResourceForm({ ...resourceForm, isNew: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="isNew" className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Mark as NEW
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 px-6 py-4 border-t ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} flex justify-end gap-3 rounded-b-2xl`}>
              <button
                onClick={() => { setShowModal(false); resetForms(); }}
                className={`px-5 py-2.5 rounded-xl font-medium ${
                  isDark 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'courses' ? handleSaveCourse : handleSaveResource}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                <Save size={16} />
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
