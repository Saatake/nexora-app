import AppShell from '@/components/AppShell';
import ImageCropModal from '@/components/ImageCropModal';
import { useNewProject } from '@/features/project-form/hooks/useNewProject';
import ProjectFormBasicInfo from '@/features/project-form/components/ProjectFormBasicInfo';
import ProjectFormTeam from '@/features/project-form/components/ProjectFormTeam';
import ProjectFormDescription from '@/features/project-form/components/ProjectFormDescription';
import ProjectFormFiles from '@/features/project-form/components/ProjectFormFiles';
import ProjectFormPrivacy from '@/features/project-form/components/ProjectFormPrivacy';

const NewProjectPage = () => {
  const {
    title, setTitle,
    category, setCategory,
    summary, setSummary,
    description, setDescription,
    githubLink, setGithubLink,
    course, setCourse,
    area, setArea,
    advisor, setAdvisor,
    collaborators, setCollaborators,
    isPrivate, setIsPrivate,
    isSaving,
    error,
    currentUser,
    fileUpload,
    handleSubmit,
  } = useNewProject();

  return (
    <AppShell title="Criar Novo Projeto" subtitle="Preencha as informações abaixo para publicar seu trabalho acadêmico." showSearch={false}>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <ProjectFormBasicInfo
          title={title} setTitle={setTitle}
          category={category} setCategory={setCategory}
          course={course} setCourse={setCourse}
          area={area} setArea={setArea}
        />

        <ProjectFormTeam
          collaborators={collaborators}
          setCollaborators={setCollaborators}
          excludeIds={currentUser?.id ? [currentUser.id] : []}
          advisor={advisor}
          setAdvisor={setAdvisor}
        />

        <ProjectFormDescription
          summary={summary} setSummary={setSummary}
          description={description} setDescription={setDescription}
        />

        <ProjectFormFiles
          githubLink={githubLink} setGithubLink={setGithubLink}
          fileUrl={fileUpload.fileUrl} setFileUrl={fileUpload.setFileUrl}
          coverPreview={fileUpload.coverPreview}
          isUploadingCover={fileUpload.isUploadingCover}
          isUploading={fileUpload.isUploading}
          uploadedFileName={fileUpload.uploadedFileName}
          uploadError={fileUpload.uploadError}
          coverInputRef={fileUpload.coverInputRef}
          onCoverFileSelected={fileUpload.handleCoverFileSelected}
          onFileUpload={fileUpload.handleFileUpload}
          onRemoveCover={() => { fileUpload.setCoverPreview(null); fileUpload.setImageUrl(''); }}
        />

        <ProjectFormPrivacy isPrivate={isPrivate} setIsPrivate={setIsPrivate} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-300 text-white text-sm font-bold rounded shadow transition-colors"
          >
            {isSaving ? 'Publicando...' : 'Publicar projeto'}
          </button>
        </div>
      </form>

      {fileUpload.cropSrc && (
        <ImageCropModal
          imageSrc={fileUpload.cropSrc}
          aspect={16 / 9}
          onConfirm={fileUpload.handleCropConfirm}
          onCancel={() => fileUpload.setCropSrc(null)}
        />
      )}
    </AppShell>
  );
};

export default NewProjectPage;
