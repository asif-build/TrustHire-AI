import logging
from .resume_parser import parse_resume
from .job_parser import parse_job
from .ranking_service import calculate_ranking
from .trust_service import calculate_trust_score
from .trajectory_service import calculate_trajectory
from .embedding_service import generate_embeddings

logger = logging.getLogger(__name__)

class AIService:
    """
    Coordinating service for all AI modules.
    Provides entry points for resume analysis, job analysis, candidate ranking,
    trust evaluation, and career trajectory calculation.
    """
    
    @staticmethod
    def analyze_resume(resume_text):
        """
        Coordinates raw text parsing and analysis.
        """
        logger.info("Coordinating resume analysis via AIService")
        # TODO: Integrate LLM provider (e.g. Gemini, OpenAI) to extract structured schema
        return parse_resume(resume_text)
        
    @staticmethod
    def analyze_job(job_text):
        """
        Coordinates job description parsing.
        """
        logger.info("Coordinating job description analysis via AIService")
        # TODO: Integrate LLM provider to extract requirements, skills, and domain
        return parse_job(job_text)
        
    @staticmethod
    def rank_candidate(resume_analysis, job_analysis):
        """
        Coordinates semantic matching, skills checks, and experience alignment.
        """
        logger.info("Coordinating candidate ranking calculation")
        return calculate_ranking(resume_analysis, job_analysis)
        
    @staticmethod
    def generate_trust_report(candidate_profile, resume_analysis):
        """
        Coordinators validation check points for Trust Score.
        """
        logger.info("Coordinating candidate trust report generation")
        return calculate_trust_score(candidate_profile, resume_analysis)
        
    @staticmethod
    def evaluate_career_trajectory(resume_analysis):
        """
        Coordinates parsing growth rate and career path trajectory vectors.
        """
        logger.info("Coordinating career trajectory evaluation")
        return calculate_trajectory(resume_analysis)
